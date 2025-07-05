import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto, tenant: any, user: any): Promise<({
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
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        creditAccount: {
            id: string;
            name: string;
            balance: import("@prisma/client/runtime/library").Decimal;
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
    }) | {
        statusCode: any;
        message: any;
    }>;
    findAll(paginationDto: PaginationDto, filtersDto: TransactionFiltersDto, tenant: any, user: any): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
    } | {
        statusCode: any;
        message: any;
    }>;
    getStats(dateFrom?: string, dateTo?: string, tenant?: any): Promise<{
        totalTransactions: number;
        totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TransactionGroupByOutputType, "type"[]> & {
            _count: {
                type: number;
            };
            _sum: {
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        })[];
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TransactionGroupByOutputType, "status"[]> & {
            _count: {
                status: number;
            };
        })[];
        byCategory: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TransactionGroupByOutputType, "categoryId"[]> & {
            _count: {
                categoryId: number;
            };
            _sum: {
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        })[];
    }>;
    findOne(id: string, tenant: any): Promise<{
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
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        receiptUrl: string | null;
        network: string | null;
        categoryId: string | null;
    }>;
    update(id: string, updateTransactionDto: UpdateTransactionDto, tenant: any, user: any): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        receiptUrl: string | null;
        network: string | null;
        categoryId: string | null;
    }>;
    validateTransaction(id: string, tenant: any, user: any): Promise<{
        category: {
            id: string;
            name: string;
            color: string;
            icon: string;
        };
        debitAccount: {
            id: string;
            name: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        creditAccount: {
            id: string;
            name: string;
            balance: import("@prisma/client/runtime/library").Decimal;
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
    }>;
    rejectTransaction(id: string, reason: string, tenant: any, user: any): Promise<{
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
    }>;
    remove(id: string, tenant: any, user: any): Promise<{
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
    }>;
}
