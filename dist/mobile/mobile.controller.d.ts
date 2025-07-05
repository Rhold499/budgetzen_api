import { MobileService } from './mobile.service';
import { MobileAccount } from './mobile.types';
export declare class MobileController {
    private readonly mobileService;
    constructor(mobileService: MobileService);
    getDashboard(tenant: {
        id: string;
    }, user: {
        id: string;
    }): Promise<import("./mobile.types").MobileDashboard>;
    getAccounts(tenant: {
        id: string;
    }, user: {
        id: string;
    }): Promise<MobileAccount[]>;
    getTransactions(page?: number, limit?: number, accountId?: string, tenant?: any): Promise<{
        data: import("./mobile.types").MobileTransaction[];
        hasMore: boolean;
    }>;
    createQuickTransaction(createTransactionDto: {
        amount: number;
        type: 'DEBIT' | 'CREDIT';
        description?: string;
        accountId: string;
        category?: string;
    }, tenant: {
        id: string;
    }, user: {
        id: string;
    }): Promise<import("./mobile.types").MobileTransaction>;
    getAccountBalance(accountId: string, tenant: {
        id: string;
    }): Promise<{
        balance: number;
        currency: string;
    }>;
    searchTransactions(query: string, limit?: number, tenant?: any): Promise<import("./mobile.types").MobileTransaction[]>;
}
