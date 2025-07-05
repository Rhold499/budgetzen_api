import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma, CategoryType } from '@prisma/client';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    tenantId: string,
    createdById: string,
  ) {
    // Vérification du plan pour la feature 'category_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'category_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Category management feature not available in your current plan',
      );
    }

    // Check if category name already exists for this tenant
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        tenantId,
        name: createCategoryDto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        tenantId,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string | undefined,
    type?: CategoryType,
    isActive?: boolean,
    userRole?: string, // <-- add userRole param
  ) {
    // Vérification du plan pour la feature 'category_management' (sauf SUPERADMIN)
    if (userRole !== 'SUPERADMIN') {
      const hasFeature = await this.plansService.validatePlanFeature(
        tenantId,
        'category_management',
      );
      if (!hasFeature) {
        throw new ForbiddenException(
          'Category management feature not available in your current plan',
        );
      }
    }

    // Pour SUPERADMIN, ignorer tenantId pour tout voir
    const where: Prisma.CategoryWhereInput =
      userRole === 'SUPERADMIN' ? {} : { tenantId };

    if (type) {
      where.OR = [{ type }, { type: 'BOTH' }];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    return this.prisma.category.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'category_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'category_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Category management feature not available in your current plan',
      );
    }

    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    tenantId: string,
  ) {
    // Vérification du plan pour la feature 'category_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'category_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Category management feature not available in your current plan',
      );
    }

    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if new name conflicts with existing category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          tenantId,
          name: updateCategoryDto.name,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'category_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'category_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Category management feature not available in your current plan',
      );
    }

    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category is used in transactions or budgets
    const usage = await this.prisma.category.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (usage && (usage._count.transactions > 0 || usage._count.budgets > 0)) {
      // Instead of deleting, mark as inactive
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string, categoryId?: string) {
    const where: Prisma.TransactionWhereInput = {
      tenantId,
      status: 'VALIDATED',
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [totalTransactions, totalAmount, monthlyStats] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where,
        _count: { categoryId: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyStats,
    };
  }
}
