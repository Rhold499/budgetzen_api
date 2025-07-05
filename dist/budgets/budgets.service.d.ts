import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Prisma } from '@prisma/client';
export declare class BudgetsService {
    private prisma;
    private plansService;
    constructor(prisma: PrismaService, plansService: PlansService);
    create(createBudgetDto: CreateBudgetDto, tenantId: string, createdById: string): Promise<{
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
        amount: Prisma.Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: Prisma.Decimal | null;
        spent: Prisma.Decimal;
    }>;
    findAll(tenantId: string | undefined, month?: number, year?: number, categoryId?: string, userRole?: string): Promise<({
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
        amount: Prisma.Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: Prisma.Decimal | null;
        spent: Prisma.Decimal;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
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
            amount: Prisma.Decimal;
            reference: string | null;
            metadata: Prisma.JsonValue | null;
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
        amount: Prisma.Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: Prisma.Decimal | null;
        spent: Prisma.Decimal;
    }>;
    update(id: string, updateBudgetDto: UpdateBudgetDto, tenantId: string): Promise<{
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
        amount: Prisma.Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: Prisma.Decimal | null;
        spent: Prisma.Decimal;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string;
        currency: string;
        amount: Prisma.Decimal;
        categoryId: string;
        month: number;
        year: number;
        alertAt: Prisma.Decimal | null;
        spent: Prisma.Decimal;
    }>;
    updateSpentAmounts(tenantId: string, categoryId: string, transactionDate: Date): Promise<void>;
    getBudgetSummary(tenantId: string, month?: number, year?: number): Promise<{
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
            amount: Prisma.Decimal;
            categoryId: string;
            month: number;
            year: number;
            alertAt: Prisma.Decimal | null;
            spent: Prisma.Decimal;
        })[];
        period: {
            month: number;
            year: number;
        };
    }>;
    private calculateSpentAmount;
}
