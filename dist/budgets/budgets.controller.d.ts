import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    create(createBudgetDto: CreateBudgetDto, tenant: any, user: any): Promise<({
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CategoryType;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: import("@prisma/client/runtime/library").Decimal | null;
        spent: import("@prisma/client/runtime/library").Decimal;
    }) | {
        statusCode: any;
        message: any;
    }>;
    findAll(month?: number, year?: number, categoryId?: string, tenant?: any, user?: any): Promise<({
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CategoryType;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: import("@prisma/client/runtime/library").Decimal | null;
        spent: import("@prisma/client/runtime/library").Decimal;
    })[] | {
        statusCode: any;
        message: any;
    }>;
    getSummary(month?: number, year?: number, tenant?: any): Promise<{
        summary: {
            totalBudget: number;
            totalSpent: number;
            overBudgetCount: number;
            nearLimitCount: number;
        };
        budgets: ({
            category: {
                id: string;
                name: string;
                type: import(".prisma/client").$Enums.CategoryType;
                color: string;
                icon: string;
            };
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            createdById: string;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            categoryId: string;
            month: number;
            year: number;
            alertAt: import("@prisma/client/runtime/library").Decimal | null;
            spent: import("@prisma/client/runtime/library").Decimal;
        })[];
        period: {
            month: number;
            year: number;
        };
    }>;
    findOne(id: string, tenant: any): Promise<{
        progress: number;
        isOverBudget: boolean;
        isNearLimit: boolean;
        remaining: number;
        recentTransactions: ({
            debitAccount: {
                name: string;
            };
            creditAccount: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            createdById: string;
            currency: string;
            creditAccountId: string | null;
            debitAccountId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            receiptUrl: string | null;
            network: string | null;
            categoryId: string | null;
        })[];
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CategoryType;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: import("@prisma/client/runtime/library").Decimal | null;
        spent: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, updateBudgetDto: UpdateBudgetDto, tenant: any): Promise<{
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CategoryType;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: import("@prisma/client/runtime/library").Decimal | null;
        spent: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string, tenant: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: import("@prisma/client/runtime/library").Decimal | null;
        spent: import("@prisma/client/runtime/library").Decimal;
    }>;
}
