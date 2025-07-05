import { BudgetAnalyticsService } from './budget-analytics.service';
export declare class BudgetAnalyticsController {
    private readonly budgetAnalyticsService;
    constructor(budgetAnalyticsService: BudgetAnalyticsService);
    getDashboard(tenant: any): Promise<{
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
            amount: number | import("@prisma/client/runtime/library").Decimal;
            transactionCount: number;
        }[];
    }>;
    getExpensesByCategory(month?: number, year?: number, tenant?: any): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        amount: number | import("@prisma/client/runtime/library").Decimal;
        transactionCount: number;
    }[]>;
    getMonthlyEvolution(year?: number, categoryId?: string, tenant?: any): Promise<any[]>;
    getBudgetVsActual(month?: number, year?: number, tenant?: any): Promise<{
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
    getGoalProgress(tenant: any): Promise<{
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
}
