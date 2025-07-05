import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { BudgetsService } from '../budgets/budgets.service';
import { PlansService } from '../plans/plans.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionStatus, TransactionType, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
    private budgetsService?: BudgetsService, // Optional to avoid circular dependency
    private plansService?: PlansService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    tenantId: string,
    createdById: string,
  ) {
    // Vérification du plan pour la feature 'transaction_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'transaction_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Transaction management feature not available in your current plan',
      );
    }

    const { debitAccountId, creditAccountId, amount, type, categoryId } =
      createTransactionDto;

    // Validate accounts exist and belong to tenant
    if (debitAccountId) {
      const debitAccount = await this.prisma.account.findFirst({
        where: { id: debitAccountId, tenantId },
      });
      if (!debitAccount) {
        throw new NotFoundException('Debit account not found');
      }
    }

    if (creditAccountId) {
      const creditAccount = await this.prisma.account.findFirst({
        where: { id: creditAccountId, tenantId },
      });
      if (!creditAccount) {
        throw new NotFoundException('Credit account not found');
      }
    }

    // Validate category exists and belongs to tenant
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, tenantId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Generate unique reference
    const reference =
      createTransactionDto.reference ||
      `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          ...createTransactionDto,
          reference,
          tenantId,
          createdById,
          status: TransactionStatus.PENDING,
        },
        include: {
          debitAccount: {
            select: { id: true, name: true, balance: true },
          },
          creditAccount: {
            select: { id: true, name: true, balance: true },
          },
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_TRANSACTION',
          entityType: 'Transaction',
          entityId: transaction.id,
          newValues: transaction,
          userId: createdById,
          transactionId: transaction.id,
        },
      });

      // Trigger webhook
      await this.webhooksService.onTransactionCreated(transaction);

      return transaction;
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
    userRole?: string,
  ) {
    // Vérification du plan pour la feature 'transaction_management' (sauf SUPERADMIN)
    if (userRole !== 'SUPERADMIN') {
      const hasFeature = await this.plansService.validatePlanFeature(
        tenantId,
        'transaction_management',
      );
      if (!hasFeature) {
        throw new ForbiddenException(
          'Transaction management feature not available in your current plan',
        );
      }
    }

    const skip = (page - 1) * limit;
    const where: Prisma.TransactionWhereInput = tenantId ? { tenantId } : {};
    // Si SUPERADMIN, where reste vide pour tout voir
    if (userRole === 'SUPERADMIN') {
      // where reste vide
    }
    // Apply filters
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.accountId) {
      where.OR = [
        { debitAccountId: filters.accountId },
        { creditAccountId: filters.accountId },
      ];
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.dateFrom) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' && where.createdAt
          ? where.createdAt
          : {}),
        gte: new Date(filters.dateFrom),
      };
    }
    if (filters?.dateTo) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' && where.createdAt
          ? where.createdAt
          : {}),
        lte: new Date(filters.dateTo),
      };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          debitAccount: {
            select: { id: true, name: true },
          },
          creditAccount: {
            select: { id: true, name: true },
          },
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'transaction_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'transaction_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Transaction management feature not available in your current plan',
      );
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        debitAccount: {
          select: { id: true, name: true, type: true },
        },
        creditAccount: {
          select: { id: true, name: true, type: true },
        },
        category: {
          select: { id: true, name: true, color: true, icon: true, type: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        auditLogs: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        goalContributions: {
          include: {
            goal: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    tenantId: string,
    userId: string,
  ) {
    // Vérification du plan pour la feature 'transaction_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'transaction_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Transaction management feature not available in your current plan',
      );
    }

    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (existingTransaction.status === TransactionStatus.VALIDATED) {
      throw new BadRequestException('Cannot update validated transaction');
    }

    // Validate category if provided
    if (updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: updateTransactionDto.categoryId, tenantId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: updateTransactionDto,
        include: {
          debitAccount: {
            select: { id: true, name: true },
          },
          creditAccount: {
            select: { id: true, name: true },
          },
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'UPDATE_TRANSACTION',
          entityType: 'Transaction',
          entityId: id,
          oldValues: existingTransaction,
          newValues: updatedTransaction,
          userId,
          transactionId: id,
        },
      });

      return updatedTransaction;
    });
  }

  async validateTransaction(id: string, tenantId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        debitAccount: true,
        creditAccount: true,
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending transactions can be validated',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let oldDebitBalance: number | undefined;
      let oldCreditBalance: number | undefined;

      // Update account balances
      if (transaction.debitAccountId && transaction.debitAccount) {
        oldDebitBalance = parseFloat(transaction.debitAccount.balance.toString());
        const newBalance = oldDebitBalance - parseFloat(transaction.amount.toString());
        if (newBalance < 0) {
          throw new BadRequestException('Insufficient funds in debit account');
        }

        await tx.account.update({
          where: { id: transaction.debitAccountId },
          data: { balance: newBalance.toString() },
        });

        // Trigger balance change webhook
        await this.webhooksService.onAccountBalanceChanged(
          transaction.debitAccount,
          oldDebitBalance.toString(),
          newBalance.toString(),
        );
      }

      if (transaction.creditAccountId && transaction.creditAccount) {
        oldCreditBalance = parseFloat(transaction.creditAccount.balance.toString());
        const newBalance = oldCreditBalance + parseFloat(transaction.amount.toString());
        await tx.account.update({
          where: { id: transaction.creditAccountId },
          data: { balance: newBalance.toString() },
        });

        // Trigger balance change webhook
        await this.webhooksService.onAccountBalanceChanged(
          transaction.creditAccount,
          oldCreditBalance.toString(),
          newBalance.toString(),
        );
      }

      // Update transaction status
      const validatedTransaction = await tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.VALIDATED },
        include: {
          debitAccount: {
            select: { id: true, name: true, balance: true },
          },
          creditAccount: {
            select: { id: true, name: true, balance: true },
          },
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'VALIDATE_TRANSACTION',
          entityType: 'Transaction',
          entityId: id,
          oldValues: { status: TransactionStatus.PENDING },
          newValues: { status: TransactionStatus.VALIDATED },
          userId,
          transactionId: id,
        },
      });

      // Update budget spent amounts if category is set
      if (transaction.categoryId && this.budgetsService) {
        await this.budgetsService.updateSpentAmounts(
          tenantId,
          transaction.categoryId,
          transaction.createdAt,
        );
      }

      // Trigger webhook
      await this.webhooksService.onTransactionValidated(validatedTransaction);

      return validatedTransaction;
    });
  }

  async rejectTransaction(
    id: string,
    tenantId: string,
    userId: string,
    reason?: string,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending transactions can be rejected',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const rejectedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.REJECTED,
          metadata: {
            ...(typeof transaction.metadata === 'object' &&
            transaction.metadata !== null &&
            !Array.isArray(transaction.metadata)
              ? (transaction.metadata as Record<string, any>)
              : {}),
            rejectionReason: reason,
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'REJECT_TRANSACTION',
          entityType: 'Transaction',
          entityId: id,
          oldValues: { status: TransactionStatus.PENDING },
          newValues: { status: TransactionStatus.REJECTED, reason },
          userId,
          transactionId: id,
        },
      });

      return rejectedTransaction;
    });
  }

  async remove(id: string, tenantId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.VALIDATED) {
      throw new BadRequestException('Cannot delete validated transaction');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create audit log before deletion
      await tx.auditLog.create({
        data: {
          action: 'DELETE_TRANSACTION',
          entityType: 'Transaction',
          entityId: id,
          oldValues: transaction,
          userId,
        },
      });

      return tx.transaction.delete({
        where: { id },
      });
    });
  }

  async getStats(tenantId: string, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.TransactionWhereInput = {
      tenantId,
      status: TransactionStatus.VALIDATED,
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [
      totalTransactions,
      totalAmount,
      transactionsByType,
      transactionsByStatus,
      transactionsByCategory,
    ] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, categoryId: { not: null } },
        _count: { categoryId: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      byType: transactionsByType,
      byStatus: transactionsByStatus,
      byCategory: transactionsByCategory,
    };
  }

  // TODO: Support transactions crypto
  // - Vérifier le réseau (network) et l'adresse du compte
  // - Intégrer la création et le suivi de transactions sur la blockchain
  // - Gérer les confirmations, frais, et statuts spécifiques crypto
}
