import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AccountsService } from '../accounts/accounts.service';
import { MobileDashboard, MobileTransaction } from './mobile.types';
interface MobileAccount {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    transactionCount: number;
}
export declare class MobileService {
    private prisma;
    private transactionsService;
    private accountsService;
    constructor(prisma: PrismaService, transactionsService: TransactionsService, accountsService: AccountsService);
    getMobileDashboard(tenantId: string, userId: string): Promise<MobileDashboard>;
    getMobileAccounts(tenantId: string, userId: string): Promise<MobileAccount[]>;
    getMobileTransactions(tenantId: string, page?: number, limit?: number, accountId?: string): Promise<{
        data: MobileTransaction[];
        hasMore: boolean;
    }>;
    createQuickTransaction(tenantId: string, userId: string, data: {
        amount: number;
        type: 'DEBIT' | 'CREDIT';
        description?: string;
        accountId: string;
        category?: string;
    }): Promise<MobileTransaction>;
    getAccountBalance(tenantId: string, accountId: string): Promise<{
        balance: number;
        currency: string;
    }>;
    searchTransactions(tenantId: string, query: string, limit?: number): Promise<MobileTransaction[]>;
    private getRecentTransactions;
    private getMonthlyStats;
}
export {};
