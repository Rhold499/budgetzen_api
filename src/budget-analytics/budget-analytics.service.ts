import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getExpensesByCategory(tenantId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const expenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        tenantId,
        status: 'VALIDATED',
        type: { in: ['DEBIT', 'WITHDRAWAL', 'PAYMENT'] },
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        categoryId: { not: null },
      },
      _sum: { amount: true },
      _count: { categoryId: true },
    });

    // Get category details
    const categoryIds = expenses.map((e) => e.categoryId).filter(Boolean);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return expenses
      .map((expense) => ({
        category: categoryMap.get(expense.categoryId!),
        amount: expense._sum.amount || 0,
        transactionCount: expense._count.categoryId,
      }))
      .filter((e) => e.category);
  }

  async getMonthlyEvolution(
    tenantId: string,
    year?: number,
    categoryId?: string,
  ) {
    const targetYear = year || new Date().getFullYear();

    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(targetYear, month - 1, 1);
      const endDate = new Date(targetYear, month, 1);

      const where: Prisma.TransactionWhereInput = {
        tenantId,
        status: 'VALIDATED',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      const [income, expenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            ...where,
            type: { in: ['CREDIT', 'DEPOSIT'] },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            ...where,
            type: { in: ['DEBIT', 'WITHDRAWAL', 'PAYMENT'] },
          },
          _sum: { amount: true },
        }),
      ]);

      monthlyData.push({
        month,
        monthName: new Date(targetYear, month - 1).toLocaleString('default', {
          month: 'long',
        }),
        income: income._sum.amount?.toNumber() || 0,
        expenses: expenses._sum.amount?.toNumber() || 0,
        net:
          (income._sum.amount?.toNumber() || 0) -
          (expenses._sum.amount?.toNumber() || 0),
      });
    }

    return monthlyData;
  }

  async getBudgetVsActual(tenantId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const budgets = await this.prisma.budget.findMany({
      where: {
        tenantId,
        month: targetMonth,
        year: targetYear,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return budgets.map((budget) => {
      const progress =
        budget.amount.toNumber() > 0
          ? (budget.spent.toNumber() / budget.amount.toNumber()) * 100
          : 0;

      return {
        category: budget.category,
        budgeted: budget.amount.toNumber(),
        spent: budget.spent.toNumber(),
        remaining: Math.max(
          0,
          budget.amount.toNumber() - budget.spent.toNumber(),
        ),
        progress,
        isOverBudget: budget.spent.toNumber() > budget.amount.toNumber(),
        variance: budget.spent.toNumber() - budget.amount.toNumber(),
      };
    });
  }

  async getGoalProgress(tenantId: string) {
    const goals = await this.prisma.goal.findMany({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: { priority: 'asc' },
    });

    return goals.map((goal) => {
      const progress =
        goal.targetAmount.toNumber() > 0
          ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100
          : 0;

      let daysRemaining = null;
      if (goal.targetDate) {
        const today = new Date();
        const target = new Date(goal.targetDate);
        daysRemaining = Math.ceil(
          (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      return {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.targetAmount.toNumber(),
        currentAmount: goal.currentAmount.toNumber(),
        remaining: Math.max(
          0,
          goal.targetAmount.toNumber() - goal.currentAmount.toNumber(),
        ),
        progress,
        isCompleted:
          goal.currentAmount.toNumber() >= goal.targetAmount.toNumber(),
        priority: goal.priority,
        targetDate: goal.targetDate,
        daysRemaining,
        contributionCount: goal._count.contributions,
        status: goal.status,
      };
    });
  }

  async getDashboardSummary(tenantId: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [budgetSummary, expensesByCategory, goalProgress, monthlyComparison] =
      await Promise.all([
        this.getBudgetVsActual(tenantId, currentMonth, currentYear),
        this.getExpensesByCategory(tenantId, currentMonth, currentYear),
        this.getGoalProgress(tenantId),
        this.getMonthlyEvolution(tenantId, currentYear),
      ]);

    // Calculate totals
    const totalBudgeted = budgetSummary.reduce((sum, b) => sum + b.budgeted, 0);
    const totalSpent = budgetSummary.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetSummary.filter((b) => b.isOverBudget).length;

    const activeGoals = goalProgress.filter(
      (g) => g.status === 'ACTIVE',
    ).length;
    const completedGoals = goalProgress.filter(
      (g) => g.status === 'COMPLETED',
    ).length;
    const totalGoalAmount = goalProgress.reduce(
      (sum, g) => sum + g.targetAmount,
      0,
    );
    const totalGoalProgress = goalProgress.reduce(
      (sum, g) => sum + g.currentAmount,
      0,
    );

    // Current month vs previous month
    const currentMonthData = monthlyComparison[currentMonth - 1];
    const previousMonthData =
      currentMonth > 1 ? monthlyComparison[currentMonth - 2] : null;

    return {
      period: { month: currentMonth, year: currentYear },
      budgets: {
        totalBudgeted,
        totalSpent,
        remaining: Math.max(0, totalBudgeted - totalSpent),
        overBudgetCount,
        budgetCount: budgetSummary.length,
        progress: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      },
      goals: {
        activeGoals,
        completedGoals,
        totalGoals: activeGoals + completedGoals,
        totalTargetAmount: totalGoalAmount,
        totalCurrentAmount: totalGoalProgress,
        overallProgress:
          totalGoalAmount > 0 ? (totalGoalProgress / totalGoalAmount) * 100 : 0,
      },
      currentMonth: currentMonthData,
      monthlyComparison: previousMonthData
        ? {
            incomeChange: currentMonthData.income - previousMonthData.income,
            expenseChange:
              currentMonthData.expenses - previousMonthData.expenses,
            netChange: currentMonthData.net - previousMonthData.net,
          }
        : null,
      topExpenseCategories: expensesByCategory
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5),
    };
  }
}
