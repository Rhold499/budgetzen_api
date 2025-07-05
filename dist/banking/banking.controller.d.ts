import { BankingService } from './banking.service';
export declare class ConnectBankDto {
    bankName: string;
    connectionType: 'open_banking' | 'scraping' | 'manual';
    credentials: any;
}
export declare class BankTransactionDto {
    amount: string;
    description: string;
}
export declare class BankingController {
    private readonly bankingService;
    constructor(bankingService: BankingService);
    connectBank(connectBankDto: ConnectBankDto, tenant: any): Promise<import("./banking.types").BankConnection>;
    getBankConnections(tenant: any): Promise<import("./banking.types").BankConnection[]>;
    syncBankTransactions(connectionId: string, tenant: any): Promise<{
        imported: number;
        errors: number;
    }>;
    getBankAccounts(connectionId: string, tenant: any): Promise<import("./banking.types").BankAccount[]>;
    disconnectBank(connectionId: string, tenant: any): Promise<{
        message: string;
    }>;
    getSupportedBanks(): {
        banks: {
            name: string;
            country: string;
            connectionTypes: string[];
            logo: string;
        }[];
    };
}
