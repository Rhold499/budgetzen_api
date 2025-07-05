import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(createAccountDto: CreateAccountDto, tenant: any, user: any): Promise<({
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.AccountType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }) | {
        statusCode: any;
        message: any;
    }>;
    findAll(paginationDto: PaginationDto, tenant: any, user: any): Promise<{
        data: ({
            _count: {
                debitTransactions: number;
                creditTransactions: number;
            };
            owner: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import(".prisma/client").$Enums.AccountType;
            description: string | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            address: string | null;
            ownerId: string;
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
    findOne(id: string, tenant: any, user: any): Promise<{
        _count: {
            debitTransactions: number;
            creditTransactions: number;
        };
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.AccountType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    getBalance(id: string, tenant: any): Promise<{
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    getTransactionHistory(id: string, paginationDto: PaginationDto, tenant: any): Promise<{
        data: ({
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
    }>;
    update(id: string, updateAccountDto: UpdateAccountDto, tenant: any, user: any): Promise<{
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.AccountType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    remove(id: string, tenant: any, user: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.AccountType;
        description: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
}
