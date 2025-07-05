import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class BudgetAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getExpensesByCategory(tenantId: string, month?: number, year?: number): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        amount: number | Prisma.Decimal;
        transactionCount: number;
    }[]>;
    getMonthlyEvolution(tenantId: string, year?: number, categoryId?: string): Promise<any[]>;
    getBudgetVsActual(tenantId: string, month?: number, year?: number): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        budgeted: number;
        spent: number;
        remaining: number;
        progress: number;
        isOverBudget: boolean;
        variance: number;
    }[]>;
    getGoalProgress(tenantId: string): Promise<{
        id: string;
        title: string;
        targetAmount: number;
        currentAmount: number;
        remaining: number;
        progress: number;
        isCompleted: boolean;
        priority: number;
        targetDate: Date;
        daysRemaining: any;
        contributionCount: number;
        status: import(".prisma/client").$Enums.GoalStatus;
    }[]>;
    getDashboardSummary(tenantId: string): Promise<{
        period: {
            month: number;
            year: number;
        };
        budgets: {
            totalBudgeted: number;
            totalSpent: number;
            remaining: number;
            overBudgetCount: number;
            budgetCount: number;
            progress: number;
        };
        goals: {
            activeGoals: number;
            completedGoals: number;
            totalGoals: number;
            totalTargetAmount: number;
            totalCurrentAmount: number;
            overallProgress: number;
        };
        currentMonth: any;
        monthlyComparison: {
            incomeChange: number;
            expenseChange: number;
            netChange: number;
        };
        topExpenseCategories: {
            category: {
                id: string;
                name: string;
                color: string;
                icon: string;
            };
            amount: number | Prisma.Decimal;
            transactionCount: number;
        }[];
    }>;
}
