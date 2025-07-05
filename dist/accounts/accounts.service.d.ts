import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Prisma } from '@prisma/client';
export declare class AccountsService {
    private prisma;
    private plansService;
    constructor(prisma: PrismaService, plansService: PlansService);
    create(createAccountDto: CreateAccountDto, tenantId: string, ownerId: string): Promise<{
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
        balance: Prisma.Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    findAll(tenantId: string, page?: number, limit?: number, ownerId?: string, userRole?: string): Promise<{
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
            balance: Prisma.Decimal;
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
    }>;
    findOne(id: string, tenantId: string, userRole?: string, userId?: string): Promise<{
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
        balance: Prisma.Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    update(id: string, updateAccountDto: UpdateAccountDto, tenantId: string, userRole?: string, userId?: string): Promise<{
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
        balance: Prisma.Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    remove(id: string, tenantId: string, userRole?: string, userId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.AccountType;
        description: string | null;
        balance: Prisma.Decimal;
        currency: string;
        address: string | null;
        ownerId: string;
    }>;
    getBalance(id: string, tenantId: string): Promise<{
        balance: Prisma.Decimal;
        currency: string;
    }>;
    getTransactionHistory(id: string, tenantId: string, page?: number, limit?: number): Promise<{
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
}
