import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { BankConnection, BankAccount } from './banking.types';
export declare class BankingService {
    private prisma;
    private transactionsService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, transactionsService: TransactionsService, configService: ConfigService);
    connectBank(tenantId: string, bankName: string, connectionType: 'open_banking' | 'scraping' | 'manual', credentials: any): Promise<BankConnection>;
    syncBankTransactions(connectionId: string, tenantId: string): Promise<{
        imported: number;
        errors: number;
    }>;
    getBankAccounts(connectionId: string, tenantId: string): Promise<BankAccount[]>;
    disconnectBank(connectionId: string, tenantId: string): Promise<void>;
    getBankConnections(tenantId: string): Promise<BankConnection[]>;
    private validateBankConnection;
    private testOpenBankingConnection;
    private testScrapingConnection;
    private fetchBankTransactions;
    private fetchOpenBankingTransactions;
    private fetchScrapedTransactions;
    private fetchBankAccounts;
    private fetchOpenBankingAccounts;
    private fetchScrapedAccounts;
    private importBankTransaction;
    private findOrCreateBankAccount;
    private getBankConnection;
    private updateLastSync;
}
