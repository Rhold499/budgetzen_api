import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TransactionAnalysis, MonthlyInsight } from './ai.types';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async analyzeTransactions(
    tenantId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<TransactionAnalysis> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: 'VALIDATED',
        ...(dateFrom && dateTo
          ? { createdAt: { gte: dateFrom, lte: dateTo } }
          : {}),
      },
      include: {
        debitAccount: { select: { name: true, type: true } },
        creditAccount: { select: { name: true, type: true } },
      },
    });

    // Basic analysis without external AI for now
    const totalAmount = transactions.reduce(
      (sum, t) => sum + t.amount.toNumber(),
      0,
    );
    const avgTransaction = totalAmount / transactions.length || 0;

    const typeDistribution = transactions.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount.toNumber();
        return acc;
      },
      {} as { [key: string]: number },
    );

    // Calculate risk score based on transaction patterns
    const riskScore = this.calculateRiskScore(transactions, avgTransaction);

    return {
      summary: `Analyzed ${transactions.length} transactions totaling €${totalAmount.toFixed(2)}`,
      insights: [
        `Average transaction: €${avgTransaction.toFixed(2)}`,
        `Most common transaction type: ${Object.keys(typeDistribution)[0] || 'N/A'}`,
        `Transaction frequency: ${(transactions.length / 30).toFixed(1)} per day`,
      ],
      recommendations: this.generateRecommendations(
        transactions,
        typeDistribution,
      ),
      riskScore,
      categories: typeDistribution,
    };
  }

  async generateMonthlyInsights(
    tenantId: string,
    year: number,
  ): Promise<MonthlyInsight[]> {
    const insights: MonthlyInsight[] = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const transactions = await this.prisma.transaction.findMany({
        where: {
          tenantId,
          status: 'VALIDATED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const income = transactions
        .filter((t) => ['CREDIT', 'DEPOSIT'].includes(t.type))
        .reduce((sum, t) => sum + t.amount.toNumber(), 0);

      const expenses = transactions
        .filter((t) => ['DEBIT', 'WITHDRAWAL', 'PAYMENT'].includes(t.type))
        .reduce((sum, t) => sum + t.amount.toNumber(), 0);

      const unusualTransactions = this.detectUnusualTransactions(transactions);

      insights.push({
        month: new Date(year, month).toLocaleString('default', {
          month: 'long',
        }),
        totalIncome: income,
        totalExpenses: expenses,
        netFlow: income - expenses,
        topCategories: this.getTopCategories(transactions),
        unusualTransactions,
      });
    }

    return insights;
  }

  async generateSmartRecommendations(tenantId: string): Promise<string[]> {
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: 'VALIDATED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const accounts = await this.prisma.account.findMany({
      where: { tenantId },
    });

    const recommendations: string[] = [];

    // Low balance warning
    const lowBalanceAccounts = accounts.filter(
      (a) => a.balance.toNumber() < 100,
    );
    if (lowBalanceAccounts.length > 0) {
      recommendations.push(
        `Warning: ${lowBalanceAccounts.length} account(s) have low balance`,
      );
    }

    // High spending alert
    const totalSpending = recentTransactions
      .filter((t) => ['DEBIT', 'WITHDRAWAL', 'PAYMENT'].includes(t.type))
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    if (totalSpending > 5000) {
      recommendations.push(
        'High spending detected this month. Consider reviewing your expenses.',
      );
    }

    // Savings suggestion
    const totalIncome = recentTransactions
      .filter((t) => ['CREDIT', 'DEPOSIT'].includes(t.type))
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const savingsRate = (totalIncome - totalSpending) / totalIncome;
    if (savingsRate < 0.2) {
      recommendations.push(
        'Consider increasing your savings rate to at least 20% of income.',
      );
    }

    return recommendations;
  }

  private calculateRiskScore(
    transactions: any[],
    avgTransaction: number,
  ): number {
    let riskScore = 0;

    // Large transactions increase risk
    const largeTransactions = transactions.filter(
      (t) => t.amount.toNumber() > avgTransaction * 3,
    );
    riskScore += largeTransactions.length * 10;

    // Frequent small transactions might indicate unusual activity
    const smallFrequentTransactions = transactions.filter(
      (t) => t.amount.toNumber() < avgTransaction * 0.1,
    );
    if (smallFrequentTransactions.length > transactions.length * 0.5) {
      riskScore += 20;
    }

    // Normalize to 0-100 scale
    return Math.min(100, riskScore);
  }

  private generateRecommendations(
    transactions: any[],
    typeDistribution: { [key: string]: number },
  ): string[] {
    const recommendations: string[] = [];

    // High expense recommendation
    if (typeDistribution['PAYMENT'] > typeDistribution['DEPOSIT']) {
      recommendations.push(
        'Consider reviewing your payment patterns to optimize cash flow',
      );
    }

    // Diversification recommendation
    if (Object.keys(typeDistribution).length < 3) {
      recommendations.push(
        'Consider diversifying your transaction types for better financial health',
      );
    }

    // Regular savings recommendation
    if (
      !typeDistribution['DEPOSIT'] ||
      typeDistribution['DEPOSIT'] < typeDistribution['WITHDRAWAL']
    ) {
      recommendations.push(
        'Establish regular deposit patterns to improve your financial stability',
      );
    }

    return recommendations;
  }

  private detectUnusualTransactions(transactions: any[]): any[] {
    if (transactions.length === 0) return [];

    const amounts = transactions.map((t) => t.amount.toNumber());
    const avgAmount =
      amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const threshold = avgAmount * 3;

    return transactions.filter((t) => t.amount.toNumber() > threshold);
  }

  private getTopCategories(transactions: any[]): string[] {
    const categories = transactions.reduce(
      (acc, t) => {
        const category = t.metadata?.category || t.type;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    return Object.entries(categories)
      .sort(
        ([, a], [, b]) =>
          (typeof b === 'number' ? b : Number(b)) -
          (typeof a === 'number' ? a : Number(a)),
      )
      .slice(0, 3)
      .map(([category]) => category);
  }
}
