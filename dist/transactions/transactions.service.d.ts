import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { BudgetsService } from '../budgets/budgets.service';
import { PlansService } from '../plans/plans.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private prisma;
    private webhooksService;
    private budgetsService?;
    private plansService?;
    constructor(prisma: PrismaService, webhooksService: WebhooksService, budgetsService?: BudgetsService, plansService?: PlansService);
    create(createTransactionDto: CreateTransactionDto, tenantId: string, createdById: string): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        debitAccount: {
            id: string;
            name: string;
            balance: Prisma.Decimal;
        };
        creditAccount: {
            id: string;
            name: string;
            balance: Prisma.Decimal;
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
    }>;
    findAll(tenantId: string, page?: number, limit?: number, filters?: Record<string, any>, userRole?: string): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                color: string;
                icon: string;
            };
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
            debitAccount: {
                id: string;
                name: string;
            };
            creditAccount: {
                id: string;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        category: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CategoryType;
            color: string;
            icon: string;
        };
        auditLogs: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            transactionId: string | null;
        })[];
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        debitAccount: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.AccountType;
        };
        creditAccount: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.AccountType;
        };
        goalContributions: ({
            goal: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: Prisma.Decimal;
            goalId: string;
        })[];
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
    }>;
    update(id: string, updateTransactionDto: UpdateTransactionDto, tenantId: string, userId: string): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        debitAccount: {
            id: string;
            name: string;
        };
        creditAccount: {
            id: string;
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
    }>;
    validateTransaction(id: string, tenantId: string, userId: string): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        debitAccount: {
            id: string;
            name: string;
            balance: Prisma.Decimal;
        };
        creditAccount: {
            id: string;
            name: string;
            balance: Prisma.Decimal;
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
    }>;
    rejectTransaction(id: string, tenantId: string, userId: string, reason?: string): Promise<{
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
    }>;
    remove(id: string, tenantId: string, userId: string): Promise<{
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
    }>;
    getStats(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
        totalTransactions: number;
        totalAmount: number | Prisma.Decimal;
        byType: (Prisma.PickEnumerable<Prisma.TransactionGroupByOutputType, "type"[]> & {
            _count: {
                type: number;
            };
            _sum: {
                amount: Prisma.Decimal;
            };
        })[];
        byStatus: (Prisma.PickEnumerable<Prisma.TransactionGroupByOutputType, "status"[]> & {
            _count: {
                status: number;
            };
        })[];
        byCategory: (Prisma.PickEnumerable<Prisma.TransactionGroupByOutputType, "categoryId"[]> & {
            _count: {
                categoryId: number;
            };
            _sum: {
                amount: Prisma.Decimal;
            };
        })[];
    }>;
}
