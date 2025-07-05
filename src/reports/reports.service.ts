import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AccountType, Prisma } from '@prisma/client';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    tenantId: string,
    createdById: string,
  ) {
    // Vérification du plan pour la feature 'pdf_reports'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'pdf_reports',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'PDF reports feature not available in your current plan',
      );
    }

    const reportData = await this.generateReportData(createReportDto, tenantId);

    return this.prisma.report.create({
      data: {
        ...createReportDto,
        data: reportData,
        tenantId,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, page: number = 1, limit: number = 10) {
    // Vérification du plan pour la feature 'pdf_reports'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'pdf_reports',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'PDF reports feature not available in your current plan',
      );
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where: { tenantId },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where: { tenantId } }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'pdf_reports'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'pdf_reports',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'PDF reports feature not available in your current plan',
      );
    }

    const report = await this.prisma.report.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async remove(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'pdf_reports'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'pdf_reports',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'PDF reports feature not available in your current plan',
      );
    }

    const report = await this.prisma.report.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.prisma.report.delete({
      where: { id },
    });
  }

  private async generateReportData(
    createReportDto: CreateReportDto,
    tenantId: string,
  ) {
    const { type, filters } = createReportDto;

    switch (type) {
      case 'transaction_summary':
        return this.generateTransactionSummary(tenantId, filters);
      case 'account_balance':
        return this.generateAccountBalanceReport(tenantId, filters);
      case 'monthly_analysis':
        return this.generateMonthlyAnalysis(tenantId, filters);
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  }

  private async generateTransactionSummary(
    tenantId: string,
    filters?: Record<string, any>,
  ) {
    const where: Prisma.TransactionWhereInput = {
      tenantId,
      status: 'VALIDATED',
    };

    if (filters?.dateFrom) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' && where.createdAt
          ? where.createdAt
          : {}),
        gte: new Date(filters.dateFrom),
      };
    }
    if (filters?.dateTo) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' && where.createdAt
          ? where.createdAt
          : {}),
        lte: new Date(filters.dateTo),
      };
    }
    if (filters?.accountId) {
      where.OR = [
        { debitAccountId: filters.accountId },
        { creditAccountId: filters.accountId },
      ];
    }

    const [transactions, summary] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          debitAccount: { select: { id: true, name: true } },
          creditAccount: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      transactions,
      summary,
      totalTransactions: transactions.length,
      totalAmount: summary.reduce(
        (sum, item) => sum + (item._sum.amount?.toNumber() || 0),
        0,
      ),
    };
  }

  private async generateAccountBalanceReport(
    tenantId: string,
    filters?: Record<string, any>,
  ) {
    const where: Prisma.AccountWhereInput = { tenantId, isActive: true };

    if (filters?.accountType && Object.values(AccountType).includes(filters.accountType)) {
      where.type = filters.accountType as AccountType;
    }

    const accounts = await this.prisma.account.findMany({
      where,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            debitTransactions: true,
            creditTransactions: true,
          },
        },
      },
      orderBy: { balance: 'desc' },
    });

    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance.toNumber(),
      0,
    );

    return {
      accounts,
      totalBalance,
      accountCount: accounts.length,
    };
  }

  private async generateMonthlyAnalysis(tenantId: string, filters?: any) {
    const year =
      typeof filters?.year === 'number'
        ? filters.year
        : new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: 'VALIDATED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleString('default', { month: 'long' }),
      income: 0,
      expenses: 0,
      transactions: 0,
    }));

    transactions.forEach((transaction) => {
      const month = transaction.createdAt.getMonth();
      const amount = transaction.amount.toNumber();

      monthlyData[month].transactions++;

      if (['CREDIT', 'DEPOSIT'].includes(transaction.type)) {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expenses += amount;
      }
    });

    return {
      year,
      monthlyData,
      totalIncome: monthlyData.reduce((sum, month) => sum + month.income, 0),
      totalExpenses: monthlyData.reduce(
        (sum, month) => sum + month.expenses,
        0,
      ),
      totalTransactions: transactions.length,
    };
  }
}
