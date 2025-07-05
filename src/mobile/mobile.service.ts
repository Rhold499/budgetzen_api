import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AccountsService } from '../accounts/accounts.service';
import { MobileDashboard, MobileTransaction } from './mobile.types';
import { Prisma } from '@prisma/client';

interface MobileAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  transactionCount: number;
}

@Injectable()
export class MobileService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
  ) {}

  async getMobileDashboard(
    tenantId: string,
    userId: string,
  ): Promise<MobileDashboard> {
    const [accounts, recentTransactions, monthlyStats] = await Promise.all([
      this.getMobileAccounts(tenantId, userId),
      this.getRecentTransactions(tenantId, 10),
      this.getMonthlyStats(tenantId),
    ]);

    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    );

    return {
      totalBalance,
      monthlyIncome: monthlyStats.income,
      monthlyExpenses: monthlyStats.expenses,
      recentTransactions,
      accounts,
      quickStats: {
        pendingTransactions: monthlyStats.pendingCount,
        thisMonthTransactions: monthlyStats.totalCount,
        averageTransaction: monthlyStats.averageAmount,
      },
    };
  }

  async getMobileAccounts(
    tenantId: string,
    userId: string,
  ): Promise<MobileAccount[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        ownerId: userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true,
          },
        },
      },
      orderBy: { balance: 'desc' },
    });

    return accounts.map((account) => {
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        balance:
          account.balance instanceof Object &&
          typeof account.balance.toNumber === 'function'
            ? account.balance.toNumber()
            : Number(account.balance),
        currency: account.currency,
        transactionCount:
          (account._count?.debitTransactions || 0) +
          (account._count?.creditTransactions || 0),
      };
    });
  }

  async getMobileTransactions(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    accountId?: string,
  ): Promise<{ data: MobileTransaction[]; hasMore: boolean }> {
    const skip = (page - 1) * limit;
    const where: Prisma.TransactionWhereInput = { tenantId };

    if (accountId) {
      where.OR = [
        { debitAccountId: accountId },
        { creditAccountId: accountId },
      ];
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } },
      },
      skip,
      take: limit + 1, // Get one extra to check if there are more
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = transactions.length > limit;
    const data = transactions.slice(0, limit);

    return {
      data: data.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount.toNumber(),
        type: transaction.type,
        description: transaction.description || '',
        date: transaction.createdAt.toISOString(),
        status: transaction.status,
        accountName:
          transaction.debitAccount?.name || transaction.creditAccount?.name,
        category:
          typeof transaction.metadata === 'object' &&
          transaction.metadata !== null &&
          'category' in transaction.metadata
            ? (transaction.metadata as { category?: string }).category
            : undefined,
        receiptUrl: transaction.receiptUrl,
      })),
      hasMore,
    };
  }

  async createQuickTransaction(
    tenantId: string,
    userId: string,
    data: {
      amount: number;
      type: 'DEBIT' | 'CREDIT';
      description?: string;
      accountId: string;
      category?: string;
    },
  ): Promise<MobileTransaction> {
    const transaction = await this.transactionsService.create(
      {
        amount: String(data.amount),
        type: data.type,
        description: data.description,
        debitAccountId: data.type === 'DEBIT' ? data.accountId : undefined,
        creditAccountId: data.type === 'CREDIT' ? data.accountId : undefined,
        metadata: data.category ? { category: data.category } : undefined,
      },
      tenantId,
      userId,
    );

    return {
      id: transaction.id,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      description: transaction.description || '',
      date: transaction.createdAt.toISOString(),
      status: transaction.status,
      category:
        typeof transaction.metadata === 'object' &&
        transaction.metadata !== null &&
        'category' in transaction.metadata
          ? (transaction.metadata as { category?: string }).category
          : undefined,
    };
  }

  async getAccountBalance(
    tenantId: string,
    accountId: string,
  ): Promise<{ balance: number; currency: string }> {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, tenantId },
      select: { balance: true, currency: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return {
      balance: account.balance.toNumber(),
      currency: account.currency,
    };
  }

  async searchTransactions(
    tenantId: string,
    query: string,
    limit: number = 10,
  ): Promise<MobileTransaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { reference: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      description: transaction.description || '',
      date: transaction.createdAt.toISOString(),
      status: transaction.status,
      accountName:
        transaction.debitAccount?.name || transaction.creditAccount?.name,
      category:
        typeof transaction.metadata === 'object' &&
        transaction.metadata !== null &&
        'category' in transaction.metadata
          ? (transaction.metadata as { category?: string }).category
          : undefined,
    }));
  }

  private async getRecentTransactions(
    tenantId: string,
    limit: number,
  ): Promise<MobileTransaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
      include: {
        debitAccount: { select: { name: true } },
        creditAccount: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      description: transaction.description || '',
      date: transaction.createdAt.toISOString(),
      status: transaction.status,
      accountName:
        transaction.debitAccount?.name || transaction.creditAccount?.name,
      category:
        typeof transaction.metadata === 'object' &&
        transaction.metadata !== null &&
        'category' in transaction.metadata
          ? (transaction.metadata as { category?: string }).category
          : undefined,
    }));
  }

  private async getMonthlyStats(tenantId: string): Promise<{
    income: number;
    expenses: number;
    pendingCount: number;
    totalCount: number;
    averageAmount: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    });

    const income = transactions
      .filter((t) => ['CREDIT', 'DEPOSIT'].includes(t.type))
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const expenses = transactions
      .filter((t) => ['DEBIT', 'WITHDRAWAL', 'PAYMENT'].includes(t.type))
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const pendingCount = transactions.filter(
      (t) => t.status === 'PENDING',
    ).length;
    const totalAmount = transactions.reduce(
      (sum, t) => sum + t.amount.toNumber(),
      0,
    );
    const averageAmount =
      transactions.length > 0 ? totalAmount / transactions.length : 0;

    return {
      income,
      expenses,
      pendingCount,
      totalCount: transactions.length,
      averageAmount,
    };
  }
}
