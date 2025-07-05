"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BankingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("../transactions/transactions.service");
let BankingService = BankingService_1 = class BankingService {
    prisma;
    transactionsService;
    configService;
    logger = new common_1.Logger(BankingService_1.name);
    constructor(prisma, transactionsService, configService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
        this.configService = configService;
    }
    async connectBank(tenantId, bankName, connectionType, credentials) {
        try {
            await this.validateBankConnection(connectionType, credentials);
            const connection = await this.prisma.$executeRaw `
        INSERT INTO bank_connections (id, tenant_id, bank_name, connection_type, credentials, is_active, created_at, last_sync)
        VALUES (gen_random_uuid(), ${tenantId}, ${bankName}, ${connectionType}, ${JSON.stringify(credentials)}, true, now(), now())
        RETURNING *
      `;
            this.logger.log(`Bank connection created for tenant ${tenantId} with ${bankName}`);
            return {
                id: connection[0].id,
                tenantId,
                bankName,
                accountNumber: credentials.accountNumber || 'N/A',
                connectionType,
                isActive: true,
                lastSync: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to connect bank: ${error.message}`);
            throw new common_1.BadRequestException('Failed to establish bank connection');
        }
    }
    async syncBankTransactions(connectionId, tenantId) {
        const connection = await this.getBankConnection(connectionId);
        if (!connection || connection.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Bank connection not found');
        }
        try {
            const bankTransactions = await this.fetchBankTransactions(connection);
            let imported = 0;
            let errors = 0;
            for (const bankTransaction of bankTransactions) {
                try {
                    await this.importBankTransaction(connection.tenantId, bankTransaction);
                    imported++;
                }
                catch (error) {
                    this.logger.error(`Failed to import transaction: ${error.message}`);
                    errors++;
                }
            }
            await this.updateLastSync(connectionId);
            this.logger.log(`Sync completed: ${imported} imported, ${errors} errors`);
            return { imported, errors };
        }
        catch (error) {
            this.logger.error(`Bank sync failed: ${error.message}`);
            throw new common_1.BadRequestException('Failed to sync bank transactions');
        }
    }
    async getBankAccounts(connectionId, tenantId) {
        const connection = await this.getBankConnection(connectionId);
        if (!connection || connection.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Bank connection not found');
        }
        try {
            return await this.fetchBankAccounts(connection);
        }
        catch (error) {
            this.logger.error(`Failed to fetch bank accounts: ${error.message}`);
            throw new common_1.BadRequestException('Failed to fetch bank accounts');
        }
    }
    async disconnectBank(connectionId, tenantId) {
        const connection = await this.getBankConnection(connectionId);
        if (!connection || connection.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Bank connection not found');
        }
        await this.prisma.$executeRaw `
      UPDATE bank_connections 
      SET is_active = false, updated_at = now()
      WHERE id = ${connectionId}
    `;
        this.logger.log(`Bank connection ${connectionId} disconnected`);
    }
    async getBankConnections(tenantId) {
        const connections = await this.prisma.$queryRaw `
      SELECT * FROM bank_connections 
      WHERE tenant_id = ${tenantId}::uuid AND is_active = true
      ORDER BY created_at DESC
    `;
        return connections.map((conn) => ({
            id: conn.id,
            tenantId: conn.tenant_id,
            bankName: conn.bank_name,
            accountNumber: conn.account_number || 'N/A',
            connectionType: conn.connection_type,
            isActive: conn.is_active,
            lastSync: conn.last_sync,
        }));
    }
    async validateBankConnection(connectionType, credentials) {
        switch (connectionType) {
            case 'open_banking':
                if (!credentials.clientId || !credentials.clientSecret) {
                    throw new common_1.BadRequestException('Open Banking credentials required');
                }
                await this.testOpenBankingConnection(credentials);
                break;
            case 'scraping':
                if (!credentials.username || !credentials.password) {
                    throw new common_1.BadRequestException('Bank login credentials required');
                }
                await this.testScrapingConnection(credentials);
                break;
            case 'manual':
                break;
            default:
                throw new common_1.BadRequestException('Invalid connection type');
        }
    }
    async testOpenBankingConnection(credentials) {
        try {
            const response = await fetch('https://api.openbanking.example.com/test', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Open Banking API test failed');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid Open Banking credentials');
        }
    }
    async testScrapingConnection(credentials) {
        this.logger.warn('Bank scraping should be implemented with proper security measures');
        if (!credentials.username.includes('@') &&
            credentials.username.length < 3) {
            throw new common_1.BadRequestException('Invalid bank credentials format');
        }
    }
    async fetchBankTransactions(connection) {
        switch (connection.connectionType) {
            case 'open_banking':
                return this.fetchOpenBankingTransactions(connection);
            case 'scraping':
                return this.fetchScrapedTransactions(connection);
            case 'manual':
                return [];
            default:
                return [];
        }
    }
    async fetchOpenBankingTransactions(connection) {
        try {
            const response = await fetch(`https://api.openbanking.example.com/accounts/${connection.accountNumber}/transactions`, {
                headers: {
                    Authorization: `Bearer ${connection.credentials.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch transactions from Open Banking API');
            }
            const data = await response.json();
            return data.transactions.map((tx) => ({
                id: tx.transactionId,
                amount: String(Math.abs(tx.amount.amount)),
                description: tx.transactionInformation,
                date: new Date(tx.bookingDateTime),
                type: tx.amount.amount > 0 ? 'credit' : 'debit',
                balance: tx.balanceAfterTransaction?.amount ? String(tx.balanceAfterTransaction.amount) : undefined,
                merchant: tx.merchantName,
            }));
        }
        catch (error) {
            this.logger.error(`Open Banking fetch failed: ${error.message}`);
            return [];
        }
    }
    async fetchScrapedTransactions(connection) {
        this.logger.warn('Bank scraping implementation needed');
        return [
            {
                id: 'scraped-1',
                amount: '100.5',
                description: 'Scraped transaction example',
                date: new Date(),
                type: 'debit',
            },
        ];
    }
    async fetchBankAccounts(connection) {
        switch (connection.connectionType) {
            case 'open_banking':
                return this.fetchOpenBankingAccounts(connection);
            case 'scraping':
                return this.fetchScrapedAccounts(connection);
            default:
                return [];
        }
    }
    async fetchOpenBankingAccounts(connection) {
        try {
            const response = await fetch('https://api.openbanking.example.com/accounts', {
                headers: {
                    Authorization: `Bearer ${connection.credentials.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch accounts from Open Banking API');
            }
            const data = await response.json();
            return data.accounts.map((acc) => ({
                id: acc.accountId,
                name: acc.nickname || acc.accountType,
                type: acc.accountType,
                balance: String(acc.balance.amount),
                currency: acc.balance.currency,
                accountNumber: acc.accountNumber,
            }));
        }
        catch (error) {
            this.logger.error(`Open Banking accounts fetch failed: ${error.message}`);
            return [];
        }
    }
    async fetchScrapedAccounts(connection) {
        this.logger.warn('Bank account scraping implementation needed');
        return [];
    }
    async importBankTransaction(tenantId, bankTransaction) {
        const existingTransaction = await this.prisma.transaction.findFirst({
            where: {
                tenantId,
                reference: `BANK-${bankTransaction.id}`,
            },
        });
        if (existingTransaction) {
            return;
        }
        const bankAccount = await this.findOrCreateBankAccount(tenantId);
        await this.transactionsService.create({
            amount: String(bankTransaction.amount),
            type: bankTransaction.type === 'credit' ? 'CREDIT' : 'DEBIT',
            description: bankTransaction.description,
            reference: `BANK-${bankTransaction.id}`,
            metadata: {
                source: 'bank_import',
                merchant: bankTransaction.merchant,
                category: bankTransaction.category,
            },
            debitAccountId: bankTransaction.type === 'debit' ? bankAccount.id : undefined,
            creditAccountId: bankTransaction.type === 'credit' ? bankAccount.id : undefined,
        }, tenantId, 'system');
    }
    async findOrCreateBankAccount(tenantId) {
        let bankAccount = await this.prisma.account.findFirst({
            where: {
                tenantId,
                name: 'Bank Import Account',
            },
        });
        if (!bankAccount) {
            bankAccount = await this.prisma.account.create({
                data: {
                    name: 'Bank Import Account',
                    type: 'CHECKING',
                    tenantId,
                    ownerId: 'system',
                },
            });
        }
        return bankAccount;
    }
    async getBankConnection(connectionId) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM bank_connections WHERE id = ${connectionId}::uuid AND is_active = true
    `;
        if (!result || result.length === 0) {
            return null;
        }
        const conn = result[0];
        return {
            id: conn.id,
            tenantId: conn.tenant_id,
            bankName: conn.bank_name,
            accountNumber: conn.account_number || 'N/A',
            connectionType: conn.connection_type,
            isActive: conn.is_active,
            lastSync: conn.last_sync,
            credentials: JSON.parse(conn.credentials || '{}'),
        };
    }
    async updateLastSync(connectionId) {
        await this.prisma.$executeRaw `
      UPDATE bank_connections 
      SET last_sync = now(), updated_at = now()
      WHERE id = ${connectionId}
    `;
    }
};
exports.BankingService = BankingService;
exports.BankingService = BankingService = BankingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.TransactionsService,
        config_1.ConfigService])
], BankingService);
//# sourceMappingURL=banking.service.js.map