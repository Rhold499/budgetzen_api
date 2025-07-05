"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const budgets_service_1 = require("../budgets/budgets.service");
const plans_service_1 = require("../plans/plans.service");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let TransactionsService = class TransactionsService {
    prisma;
    webhooksService;
    budgetsService;
    plansService;
    constructor(prisma, webhooksService, budgetsService, plansService) {
        this.prisma = prisma;
        this.webhooksService = webhooksService;
        this.budgetsService = budgetsService;
        this.plansService = plansService;
    }
    async create(createTransactionDto, tenantId, createdById) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'transaction_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Transaction management feature not available in your current plan');
        }
        const { debitAccountId, creditAccountId, amount, type, categoryId } = createTransactionDto;
        if (debitAccountId) {
            const debitAccount = await this.prisma.account.findFirst({
                where: { id: debitAccountId, tenantId },
            });
            if (!debitAccount) {
                throw new common_1.NotFoundException('Debit account not found');
            }
        }
        if (creditAccountId) {
            const creditAccount = await this.prisma.account.findFirst({
                where: { id: creditAccountId, tenantId },
            });
            if (!creditAccount) {
                throw new common_1.NotFoundException('Credit account not found');
            }
        }
        if (categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: categoryId, tenantId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
        }
        const reference = createTransactionDto.reference ||
            `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    ...createTransactionDto,
                    reference,
                    tenantId,
                    createdById,
                    status: client_1.TransactionStatus.PENDING,
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
            await this.webhooksService.onTransactionCreated(transaction);
            return transaction;
        });
    }
    async findAll(tenantId, page = 1, limit = 10, filters, userRole) {
        if (userRole !== 'SUPERADMIN') {
            const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'transaction_management');
            if (!hasFeature) {
                throw new common_1.ForbiddenException('Transaction management feature not available in your current plan');
            }
        }
        const skip = (page - 1) * limit;
        const where = tenantId ? { tenantId } : {};
        if (userRole === 'SUPERADMIN') {
        }
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
    async findOne(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'transaction_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Transaction management feature not available in your current plan');
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
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async update(id, updateTransactionDto, tenantId, userId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'transaction_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Transaction management feature not available in your current plan');
        }
        const existingTransaction = await this.prisma.transaction.findFirst({
            where: { id, tenantId },
        });
        if (!existingTransaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (existingTransaction.status === client_1.TransactionStatus.VALIDATED) {
            throw new common_1.BadRequestException('Cannot update validated transaction');
        }
        if (updateTransactionDto.categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: updateTransactionDto.categoryId, tenantId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
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
    async validateTransaction(id, tenantId, userId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, tenantId },
            include: {
                debitAccount: true,
                creditAccount: true,
                category: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending transactions can be validated');
        }
        return this.prisma.$transaction(async (tx) => {
            let oldDebitBalance;
            let oldCreditBalance;
            if (transaction.debitAccountId && transaction.debitAccount) {
                oldDebitBalance = parseFloat(transaction.debitAccount.balance.toString());
                const newBalance = oldDebitBalance - parseFloat(transaction.amount.toString());
                if (newBalance < 0) {
                    throw new common_1.BadRequestException('Insufficient funds in debit account');
                }
                await tx.account.update({
                    where: { id: transaction.debitAccountId },
                    data: { balance: newBalance.toString() },
                });
                await this.webhooksService.onAccountBalanceChanged(transaction.debitAccount, oldDebitBalance.toString(), newBalance.toString());
            }
            if (transaction.creditAccountId && transaction.creditAccount) {
                oldCreditBalance = parseFloat(transaction.creditAccount.balance.toString());
                const newBalance = oldCreditBalance + parseFloat(transaction.amount.toString());
                await tx.account.update({
                    where: { id: transaction.creditAccountId },
                    data: { balance: newBalance.toString() },
                });
                await this.webhooksService.onAccountBalanceChanged(transaction.creditAccount, oldCreditBalance.toString(), newBalance.toString());
            }
            const validatedTransaction = await tx.transaction.update({
                where: { id },
                data: { status: client_1.TransactionStatus.VALIDATED },
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
            await tx.auditLog.create({
                data: {
                    action: 'VALIDATE_TRANSACTION',
                    entityType: 'Transaction',
                    entityId: id,
                    oldValues: { status: client_1.TransactionStatus.PENDING },
                    newValues: { status: client_1.TransactionStatus.VALIDATED },
                    userId,
                    transactionId: id,
                },
            });
            if (transaction.categoryId && this.budgetsService) {
                await this.budgetsService.updateSpentAmounts(tenantId, transaction.categoryId, transaction.createdAt);
            }
            await this.webhooksService.onTransactionValidated(validatedTransaction);
            return validatedTransaction;
        });
    }
    async rejectTransaction(id, tenantId, userId, reason) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, tenantId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending transactions can be rejected');
        }
        return this.prisma.$transaction(async (tx) => {
            const rejectedTransaction = await tx.transaction.update({
                where: { id },
                data: {
                    status: client_1.TransactionStatus.REJECTED,
                    metadata: {
                        ...(typeof transaction.metadata === 'object' &&
                            transaction.metadata !== null &&
                            !Array.isArray(transaction.metadata)
                            ? transaction.metadata
                            : {}),
                        rejectionReason: reason,
                    },
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'REJECT_TRANSACTION',
                    entityType: 'Transaction',
                    entityId: id,
                    oldValues: { status: client_1.TransactionStatus.PENDING },
                    newValues: { status: client_1.TransactionStatus.REJECTED, reason },
                    userId,
                    transactionId: id,
                },
            });
            return rejectedTransaction;
        });
    }
    async remove(id, tenantId, userId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, tenantId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status === client_1.TransactionStatus.VALIDATED) {
            throw new common_1.BadRequestException('Cannot delete validated transaction');
        }
        return this.prisma.$transaction(async (tx) => {
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
    async getStats(tenantId, dateFrom, dateTo) {
        const where = {
            tenantId,
            status: client_1.TransactionStatus.VALIDATED,
        };
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = dateFrom;
            if (dateTo)
                where.createdAt.lte = dateTo;
        }
        const [totalTransactions, totalAmount, transactionsByType, transactionsByStatus, transactionsByCategory,] = await Promise.all([
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        webhooks_service_1.WebhooksService,
        budgets_service_1.BudgetsService,
        plans_service_1.PlansService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map