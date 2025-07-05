import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { BankConnection, BankAccount, BankTransaction } from './banking.types';

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private configService: ConfigService,
  ) {}

  async connectBank(
    tenantId: string,
    bankName: string,
    connectionType: 'open_banking' | 'scraping' | 'manual',
    credentials: any,
  ): Promise<BankConnection> {
    try {
      // Validate connection based on type
      await this.validateBankConnection(connectionType, credentials);

      const connection = await this.prisma.$executeRaw`
        INSERT INTO bank_connections (id, tenant_id, bank_name, connection_type, credentials, is_active, created_at, last_sync)
        VALUES (gen_random_uuid(), ${tenantId}, ${bankName}, ${connectionType}, ${JSON.stringify(credentials)}, true, now(), now())
        RETURNING *
      `;

      this.logger.log(
        `Bank connection created for tenant ${tenantId} with ${bankName}`,
      );

      return {
        id: connection[0].id,
        tenantId,
        bankName,
        accountNumber: credentials.accountNumber || 'N/A',
        connectionType,
        isActive: true,
        lastSync: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to connect bank: ${error.message}`);
      throw new BadRequestException('Failed to establish bank connection');
    }
  }

  async syncBankTransactions(
    connectionId: string,
    tenantId: string,
  ): Promise<{ imported: number; errors: number }> {
    const connection = await this.getBankConnection(connectionId);
    if (!connection || connection.tenantId !== tenantId) {
      throw new BadRequestException('Bank connection not found');
    }

    try {
      const bankTransactions = await this.fetchBankTransactions(connection);
      let imported = 0;
      let errors = 0;

      for (const bankTransaction of bankTransactions) {
        try {
          await this.importBankTransaction(
            connection.tenantId,
            bankTransaction,
          );
          imported++;
        } catch (error) {
          this.logger.error(`Failed to import transaction: ${error.message}`);
          errors++;
        }
      }

      // Update last sync time
      await this.updateLastSync(connectionId);

      this.logger.log(`Sync completed: ${imported} imported, ${errors} errors`);
      return { imported, errors };
    } catch (error) {
      this.logger.error(`Bank sync failed: ${error.message}`);
      throw new BadRequestException('Failed to sync bank transactions');
    }
  }

  async getBankAccounts(
    connectionId: string,
    tenantId: string,
  ): Promise<BankAccount[]> {
    const connection = await this.getBankConnection(connectionId);
    if (!connection || connection.tenantId !== tenantId) {
      throw new BadRequestException('Bank connection not found');
    }

    try {
      return await this.fetchBankAccounts(connection);
    } catch (error) {
      this.logger.error(`Failed to fetch bank accounts: ${error.message}`);
      throw new BadRequestException('Failed to fetch bank accounts');
    }
  }

  async disconnectBank(
    connectionId: string,
    tenantId: string,
  ): Promise<void> {
    const connection = await this.getBankConnection(connectionId);
    if (!connection || connection.tenantId !== tenantId) {
      throw new BadRequestException('Bank connection not found');
    }
    await this.prisma.$executeRaw`
      UPDATE bank_connections 
      SET is_active = false, updated_at = now()
      WHERE id = ${connectionId}
    `;
    this.logger.log(`Bank connection ${connectionId} disconnected`);
  }

  async getBankConnections(tenantId: string): Promise<BankConnection[]> {
    const connections = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM bank_connections 
      WHERE tenant_id = ${tenantId}::uuid AND is_active = true
      ORDER BY created_at DESC
    `;

    return connections.map((conn: any) => ({
      id: conn.id,
      tenantId: conn.tenant_id,
      bankName: conn.bank_name,
      accountNumber: conn.account_number || 'N/A',
      connectionType: conn.connection_type,
      isActive: conn.is_active,
      lastSync: conn.last_sync,
    }));
  }

  private async validateBankConnection(
    connectionType: string,
    credentials: any,
  ): Promise<void> {
    switch (connectionType) {
      case 'open_banking':
        if (!credentials.clientId || !credentials.clientSecret) {
          throw new BadRequestException('Open Banking credentials required');
        }
        // Test API connection
        await this.testOpenBankingConnection(credentials);
        break;

      case 'scraping':
        if (!credentials.username || !credentials.password) {
          throw new BadRequestException('Bank login credentials required');
        }
        // Test scraping connection (implement with caution)
        await this.testScrapingConnection(credentials);
        break;

      case 'manual':
        // Manual connections don't need validation
        break;

      default:
        throw new BadRequestException('Invalid connection type');
    }
  }

  private async testOpenBankingConnection(credentials: any): Promise<void> {
    // Implement Open Banking API test
    // This is a placeholder - implement actual Open Banking API calls
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
    } catch (error) {
      throw new BadRequestException('Invalid Open Banking credentials');
    }
  }

  private async testScrapingConnection(credentials: any): Promise<void> {
    // Implement bank scraping test (use with extreme caution)
    // This is a placeholder - implement actual bank scraping logic
    this.logger.warn(
      'Bank scraping should be implemented with proper security measures',
    );

    // For demo purposes, we'll just validate the credentials format
    if (
      !credentials.username.includes('@') &&
      credentials.username.length < 3
    ) {
      throw new BadRequestException('Invalid bank credentials format');
    }
  }

  private async fetchBankTransactions(
    connection: BankConnection,
  ): Promise<BankTransaction[]> {
    switch (connection.connectionType) {
      case 'open_banking':
        return this.fetchOpenBankingTransactions(connection);
      case 'scraping':
        return this.fetchScrapedTransactions(connection);
      case 'manual':
        return []; // Manual transactions are added directly
      default:
        return [];
    }
  }

  private async fetchOpenBankingTransactions(
    connection: BankConnection,
  ): Promise<BankTransaction[]> {
    // Implement Open Banking API calls
    // This is a placeholder implementation
    try {
      const response = await fetch(
        `https://api.openbanking.example.com/accounts/${connection.accountNumber}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${connection.credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions from Open Banking API');
      }

      const data = await response.json();

      return data.transactions.map((tx: any) => ({
        id: tx.transactionId,
        amount: String(Math.abs(tx.amount.amount)), // ensure string
        description: tx.transactionInformation,
        date: new Date(tx.bookingDateTime),
        type: tx.amount.amount > 0 ? 'credit' : 'debit',
        balance: tx.balanceAfterTransaction?.amount ? String(tx.balanceAfterTransaction.amount) : undefined, // ensure string
        merchant: tx.merchantName,
      }));
    } catch (error) {
      this.logger.error(`Open Banking fetch failed: ${error.message}`);
      return [];
    }
  }

  private async fetchScrapedTransactions(
    connection: BankConnection,
  ): Promise<BankTransaction[]> {
    // Implement bank scraping logic (use with extreme caution)
    // This is a placeholder - implement actual scraping with proper security
    this.logger.warn('Bank scraping implementation needed');

    // Return mock data for demo
    return [
      {
        id: 'scraped-1',
        amount: '100.5', // ensure string
        description: 'Scraped transaction example',
        date: new Date(),
        type: 'debit',
      },
    ];
  }

  private async fetchBankAccounts(
    connection: BankConnection,
  ): Promise<BankAccount[]> {
    switch (connection.connectionType) {
      case 'open_banking':
        return this.fetchOpenBankingAccounts(connection);
      case 'scraping':
        return this.fetchScrapedAccounts(connection);
      default:
        return [];
    }
  }

  private async fetchOpenBankingAccounts(
    connection: BankConnection,
  ): Promise<BankAccount[]> {
    // Implement Open Banking accounts API
    try {
      const response = await fetch(
        'https://api.openbanking.example.com/accounts',
        {
          headers: {
            Authorization: `Bearer ${connection.credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch accounts from Open Banking API');
      }

      const data = await response.json();

      return data.accounts.map((acc: any) => ({
        id: acc.accountId,
        name: acc.nickname || acc.accountType,
        type: acc.accountType,
        balance: String(acc.balance.amount), // ensure string
        currency: acc.balance.currency,
        accountNumber: acc.accountNumber,
      }));
    } catch (error) {
      this.logger.error(`Open Banking accounts fetch failed: ${error.message}`);
      return [];
    }
  }

  private async fetchScrapedAccounts(
    connection: BankConnection,
  ): Promise<BankAccount[]> {
    // Implement scraped accounts logic
    this.logger.warn('Bank account scraping implementation needed');
    return [];
  }

  private async importBankTransaction(
    tenantId: string,
    bankTransaction: BankTransaction,
  ): Promise<void> {
    // Check if transaction already exists
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        tenantId,
        reference: `BANK-${bankTransaction.id}`,
      },
    });

    if (existingTransaction) {
      return; // Skip duplicate
    }

    // Find or create default bank account
    const bankAccount = await this.findOrCreateBankAccount(tenantId);

    // Create transaction
    await this.transactionsService.create(
      {
        amount: String(bankTransaction.amount),
        type: bankTransaction.type === 'credit' ? 'CREDIT' : 'DEBIT',
        description: bankTransaction.description,
        reference: `BANK-${bankTransaction.id}`,
        metadata: {
          source: 'bank_import',
          merchant: bankTransaction.merchant,
          category: bankTransaction.category,
        },
        debitAccountId:
          bankTransaction.type === 'debit' ? bankAccount.id : undefined,
        creditAccountId:
          bankTransaction.type === 'credit' ? bankAccount.id : undefined,
      },
      tenantId,
      'system', // System user for bank imports
    );
  }

  private async findOrCreateBankAccount(tenantId: string): Promise<any> {
    let bankAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        name: 'Bank Import Account',
      },
    });

    if (!bankAccount) {
      // Create default bank account
      bankAccount = await this.prisma.account.create({
        data: {
          name: 'Bank Import Account',
          type: 'CHECKING',
          tenantId,
          ownerId: 'system', // System account
        },
      });
    }

    return bankAccount;
  }

  private async getBankConnection(
    connectionId: string,
  ): Promise<BankConnection | null> {
    const result = await this.prisma.$queryRaw<any[]>`
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

  private async updateLastSync(connectionId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE bank_connections 
      SET last_sync = now(), updated_at = now()
      WHERE id = ${connectionId}
    `;
  }
}
