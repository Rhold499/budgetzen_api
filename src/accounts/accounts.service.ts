import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Prisma, CategoryType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
    tenantId: string,
    ownerId: string,
  ) {
    // Check plan limits before creating account
    const canAddAccount = await this.plansService.checkPlanLimits(
      tenantId,
      'accounts',
    );
    if (!canAddAccount) {
      throw new ForbiddenException(
        'Account limit reached for your current plan',
      );
    }

    // Create the account
    const account = await this.prisma.account.create({
      data: {
        ...createAccountDto,
        tenantId,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Fetch the owner's user role
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (user?.role !== 'SUPERADMIN') {
      // Insert default categories for this tenant if not already present
      const defaultCategories = [
        { name: 'Alimentation', description: 'Courses, restaurants, nourriture', color: '#10B981', icon: '🍽️', type: 'EXPENSE' },
        { name: 'Transport', description: 'Carburant, transports publics, véhicule', color: '#3B82F6', icon: '🚗', type: 'EXPENSE' },
        { name: 'Logement', description: 'Loyer, charges, entretien', color: '#8B5CF6', icon: '🏠', type: 'EXPENSE' },
        { name: 'Santé', description: 'Médecin, pharmacie, assurance santé', color: '#EF4444', icon: '⚕️', type: 'EXPENSE' },
        { name: 'Loisirs', description: 'Sorties, hobbies, vacances', color: '#F59E0B', icon: '🎉', type: 'EXPENSE' },
        { name: 'Éducation', description: 'Formation, livres, cours', color: '#06B6D4', icon: '📚', type: 'EXPENSE' },
        { name: 'Salaire', description: 'Revenus du travail', color: '#10B981', icon: '💰', type: 'INCOME' },
        { name: 'Investissements', description: 'Dividendes, plus-values', color: '#8B5CF6', icon: '📈', type: 'INCOME' },
        { name: 'Autres revenus', description: 'Revenus divers', color: '#6B7280', icon: '💼', type: 'INCOME' },
        { name: 'Épargne', description: 'Mise de côté, placements', color: '#059669', icon: '🏦', type: 'BOTH' },
      ];
      // Récupère les catégories existantes pour ce tenant
      const existingCategories = await this.prisma.category.findMany({
        where: { tenantId },
        select: { name: true },
      });
      const existingNames = new Set(existingCategories.map(c => c.name));
      for (const cat of defaultCategories) {
        if (!existingNames.has(cat.name)) {
          await this.prisma.category.create({
            data: {
              ...cat,
              tenantId,
              createdById: ownerId,
              isActive: true,
              type: cat.type as CategoryType,
            },
          });
        }
      }
    }
    return account;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    ownerId?: string,
    userRole?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.AccountWhereInput = tenantId ? { tenantId } : {};
    if (ownerId) {
      where.ownerId = ownerId;
    }
    // Si SUPERADMIN, ignorer tenantId et ownerId (where vide)

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              debitTransactions: true,
              creditTransactions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.account.count({ where }),
    ]);

    return {
      data: accounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    tenantId: string,
    userRole?: string,
    userId?: string,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if user can access this account
    if (
      userRole !== 'SUPERADMIN' &&
      userRole !== 'ADMIN' &&
      account.ownerId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return account;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    tenantId: string,
    userRole?: string,
    userId?: string,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if user can update this account
    if (
      userRole !== 'SUPERADMIN' &&
      userRole !== 'ADMIN' &&
      account.ownerId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(
    id: string,
    tenantId: string,
    userRole?: string,
    userId?: string,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if user can delete this account
    if (
      userRole !== 'SUPERADMIN' &&
      userRole !== 'ADMIN' &&
      account.ownerId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Check if account has transactions
    const transactionCount = await this.prisma.transaction.count({
      where: {
        OR: [{ debitAccountId: id }, { creditAccountId: id }],
      },
    });

    if (transactionCount > 0) {
      throw new ForbiddenException(
        'Cannot delete account with existing transactions',
      );
    }

    return this.prisma.account.delete({
      where: { id },
    });
  }

  async getBalance(id: string, tenantId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      select: { balance: true, currency: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async getTransactionHistory(
    id: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          tenantId,
          OR: [{ debitAccountId: id }, { creditAccountId: id }],
        },
        include: {
          debitAccount: {
            select: { id: true, name: true },
          },
          creditAccount: {
            select: { id: true, name: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({
        where: {
          tenantId,
          OR: [{ debitAccountId: id }, { creditAccountId: id }],
        },
      }),
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

  // TODO: Support comptes crypto
  // - Ajouter la validation d'adresse selon le type de crypto
  // - Intégrer la récupération de solde via API blockchain
  // - Gérer la création de wallets et la sécurité associée
}
