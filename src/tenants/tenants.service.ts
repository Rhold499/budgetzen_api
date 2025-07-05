import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CategoryType } from '@prisma/client';

const DEFAULT_CATEGORIES = [
  {
    name: 'Alimentation',
    description: 'Courses, restaurants, nourriture',
    color: '#10B981',
    icon: '🍽️',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Transport',
    description: 'Carburant, transports publics, véhicule',
    color: '#3B82F6',
    icon: '🚗',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Logement',
    description: 'Loyer, charges, entretien',
    color: '#8B5CF6',
    icon: '🏠',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Santé',
    description: 'Médecin, pharmacie, assurance santé',
    color: '#EF4444',
    icon: '⚕️',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Loisirs',
    description: 'Sorties, hobbies, vacances',
    color: '#F59E0B',
    icon: '🎉',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Éducation',
    description: 'Formation, livres, cours',
    color: '#06B6D4',
    icon: '📚',
    type: CategoryType.EXPENSE,
  },
  {
    name: 'Salaire',
    description: 'Revenus du travail',
    color: '#10B981',
    icon: '💰',
    type: CategoryType.INCOME,
  },
  {
    name: 'Investissements',
    description: 'Dividendes, plus-values',
    color: '#8B5CF6',
    icon: '📈',
    type: CategoryType.INCOME,
  },
  {
    name: 'Autres revenus',
    description: 'Revenus divers',
    color: '#6B7280',
    icon: '💼',
    type: CategoryType.INCOME,
  },
  {
    name: 'Épargne',
    description: 'Mise de côté, placements',
    color: '#059669',
    icon: '🏦',
    type: CategoryType.BOTH,
  },
];

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const tenant = await this.prisma.tenant.create({
      data: createTenantDto,
    });

    // Crée les catégories principales pour le tenant (créateur = null)
    await Promise.all(
      DEFAULT_CATEGORIES.map((cat) =>
        this.prisma.category.create({
          data: {
            ...cat,
            tenantId: tenant.id,
            isDefault: true,
            createdById: null,
          },
        }),
      ),
    );

    return tenant;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        include: {
          _count: {
            select: {
              users: true,
              accounts: true,
              transactions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userRole?: string, userTenantId?: string) {
    // Only superadmin can view any tenant, others can only view their own
    if (userRole !== 'SUPERADMIN' && userTenantId !== id) {
      throw new ForbiddenException('Access denied');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            accounts: true,
            transactions: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
    userRole?: string,
    userTenantId?: string,
  ) {
    // Only superadmin can update any tenant, admins and users can only update their own
    if (userRole !== 'SUPERADMIN' && userRole !== 'ADMIN' && userRole !== 'USER') {
      throw new ForbiddenException('Access denied');
    }

    if ((userRole === 'ADMIN' || userRole === 'USER') && userTenantId !== id) {
      throw new ForbiddenException('Access denied');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [userCount, accountCount, transactionCount, totalBalance] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId } }),
        this.prisma.account.count({ where: { tenantId } }),
        this.prisma.transaction.count({ where: { tenantId } }),
        this.prisma.account.aggregate({
          where: { tenantId },
          _sum: { balance: true },
        }),
      ]);

    return {
      users: userCount,
      accounts: accountCount,
      transactions: transactionCount,
      totalBalance: totalBalance._sum.balance || 0,
    };
  }
}
