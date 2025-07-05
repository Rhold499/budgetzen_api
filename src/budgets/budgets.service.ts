import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async create(
    createBudgetDto: CreateBudgetDto,
    tenantId: string,
    createdById: string,
  ) {
    // Vérification du plan pour la feature 'budget_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'budget_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Budget management feature not available in your current plan',
      );
    }

    // Check plan limits for budget creation
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { planType: true },
    });

    if (tenant?.planType === 'FAMILY') {
      const existingBudgets = await this.prisma.budget.count({
        where: { tenantId, isActive: true },
      });

      if (existingBudgets >= 5) {
        throw new ForbiddenException(
          'Budget limit reached for Family plan (5 categories max)',
        );
      }
    }

    // Check if budget already exists for this category/month/year
    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        tenantId,
        categoryId: createBudgetDto.categoryId,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
      },
    });

    if (existingBudget) {
      throw new ConflictException(
        'Budget already exists for this category and period',
      );
    }

    // Verify category exists and belongs to tenant
    const category = await this.prisma.category.findFirst({
      where: {
        id: createBudgetDto.categoryId,
        tenantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Calculate current spent amount for this period
    const spent = await this.calculateSpentAmount(
      tenantId,
      createBudgetDto.categoryId,
      createBudgetDto.month,
      createBudgetDto.year,
    );

    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        spent,
        tenantId,
        createdById,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string | undefined,
    month?: number,
    year?: number,
    categoryId?: string,
    userRole?: string, // <-- add userRole param
  ) {
    // Vérification du plan pour la feature 'budget_management'
    if (userRole !== 'SUPERADMIN') {
      const hasFeature = await this.plansService.validatePlanFeature(
        tenantId,
        'budget_management',
      );
      if (!hasFeature) {
        throw new ForbiddenException(
          'Budget management feature not available in your current plan',
        );
      }
    }

    // Pour SUPERADMIN, ignorer tenantId pour tout voir
    const where: Prisma.BudgetWhereInput =
      userRole === 'SUPERADMIN'
        ? { isActive: true }
        : { tenantId, isActive: true };

    if (month) where.month = month;
    if (year) where.year = year;
    if (categoryId) where.categoryId = categoryId;

    const budgets = await this.prisma.budget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return budgets;
  }

  async findOne(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'budget_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'budget_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Budget management feature not available in your current plan',
      );
    }

    const budget = await this.prisma.budget.findFirst({
      where: { id, tenantId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Get recent transactions for this budget
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        categoryId: budget.categoryId,
        status: 'VALIDATED',
        createdAt: {
          gte: new Date(budget.year, budget.month - 1, 1),
          lt: new Date(budget.year, budget.month, 1),
        },
      },
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const progress =
      budget.amount.toNumber() > 0
        ? (budget.spent.toNumber() / budget.amount.toNumber()) * 100
        : 0;

    return {
      ...budget,
      progress,
      isOverBudget: budget.spent.toNumber() > budget.amount.toNumber(),
      isNearLimit: budget.alertAt
        ? progress >= budget.alertAt.toNumber() * 100
        : false,
      remaining: Math.max(
        0,
        budget.amount.toNumber() - budget.spent.toNumber(),
      ),
      recentTransactions,
    };
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, tenantId: string) {
    // Vérification du plan pour la feature 'budget_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'budget_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Budget management feature not available in your current plan',
      );
    }

    const budget = await this.prisma.budget.findFirst({
      where: { id, tenantId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // If category, month, or year is being changed, check for conflicts
    if (
      updateBudgetDto.categoryId ||
      updateBudgetDto.month ||
      updateBudgetDto.year
    ) {
      const categoryId = updateBudgetDto.categoryId || budget.categoryId;
      const month = updateBudgetDto.month || budget.month;
      const year = updateBudgetDto.year || budget.year;

      const existingBudget = await this.prisma.budget.findFirst({
        where: {
          tenantId,
          categoryId,
          month,
          year,
          id: { not: id },
        },
      });

      if (existingBudget) {
        throw new ConflictException(
          'Budget already exists for this category and period',
        );
      }
    }

    // Recalculate spent amount if period changed
    let spent = budget.spent.toNumber();
    if (
      updateBudgetDto.categoryId ||
      updateBudgetDto.month ||
      updateBudgetDto.year
    ) {
      spent = await this.calculateSpentAmount(
        tenantId,
        updateBudgetDto.categoryId || budget.categoryId,
        updateBudgetDto.month || budget.month,
        updateBudgetDto.year || budget.year,
      );
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...updateBudgetDto,
        spent,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'budget_management'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'budget_management',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Budget management feature not available in your current plan',
      );
    }

    const budget = await this.prisma.budget.findFirst({
      where: { id, tenantId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id },
    });
  }

  async updateSpentAmounts(
    tenantId: string,
    categoryId: string,
    transactionDate: Date,
  ) {
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await this.prisma.budget.findFirst({
      where: {
        tenantId,
        categoryId,
        month,
        year,
        isActive: true,
      },
    });

    if (budget) {
      const spent = await this.calculateSpentAmount(
        tenantId,
        categoryId,
        month,
        year,
      );

      await this.prisma.budget.update({
        where: { id: budget.id },
        data: { spent },
      });

      // Check for alerts
      const progress =
        budget.amount.toNumber() > 0 ? spent / budget.amount.toNumber() : 0;

      if (budget.alertAt && progress >= budget.alertAt.toNumber()) {
        // Trigger alert (could be webhook, notification, etc.)
        console.log(
          `Budget alert: ${budget.categoryId} is at ${(progress * 100).toFixed(1)}% of budget`,
        );
      }
    }
  }

  async getBudgetSummary(tenantId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const budgets = await this.findAll(tenantId, targetMonth, targetYear);

    const summary = budgets.reduce(
      (acc, budget) => {
        acc.totalBudget += budget.amount.toNumber();
        acc.totalSpent += budget.spent.toNumber();

        const isOverBudget = budget.spent.toNumber() > budget.amount.toNumber();
        const isNearLimit =
          !isOverBudget &&
          budget.spent.toNumber() > 0.9 * budget.amount.toNumber();

        if (isOverBudget) {
          acc.overBudgetCount++;
        }

        if (isNearLimit) {
          acc.nearLimitCount++;
        }

        return acc;
      },
      {
        totalBudget: 0,
        totalSpent: 0,
        overBudgetCount: 0,
        nearLimitCount: 0,
      },
    );

    summary['remaining'] = Math.max(
      0,
      summary.totalBudget - summary.totalSpent,
    );
    summary['progress'] =
      summary.totalBudget > 0
        ? (summary.totalSpent / summary.totalBudget) * 100
        : 0;

    return {
      summary,
      budgets,
      period: { month: targetMonth, year: targetYear },
    };
  }

  private async calculateSpentAmount(
    tenantId: string,
    categoryId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        categoryId,
        status: 'VALIDATED',
        type: { in: ['DEBIT', 'WITHDRAWAL', 'PAYMENT'] }, // Only expense types
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { amount: true },
    });

    return result._sum.amount?.toNumber() || 0;
  }
}
