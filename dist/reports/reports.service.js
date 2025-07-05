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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const plans_service_1 = require("../plans/plans.service");
let ReportsService = class ReportsService {
    prisma;
    plansService;
    constructor(prisma, plansService) {
        this.prisma = prisma;
        this.plansService = plansService;
    }
    async create(createReportDto, tenantId, createdById) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'pdf_reports');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('PDF reports feature not available in your current plan');
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
    async findAll(tenantId, page = 1, limit = 10) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'pdf_reports');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('PDF reports feature not available in your current plan');
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
    async findOne(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'pdf_reports');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('PDF reports feature not available in your current plan');
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
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async remove(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'pdf_reports');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('PDF reports feature not available in your current plan');
        }
        const report = await this.prisma.report.findFirst({
            where: { id, tenantId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return this.prisma.report.delete({
            where: { id },
        });
    }
    async generateReportData(createReportDto, tenantId) {
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
    async generateTransactionSummary(tenantId, filters) {
        const where = {
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
            totalAmount: summary.reduce((sum, item) => sum + (item._sum.amount?.toNumber() || 0), 0),
        };
    }
    async generateAccountBalanceReport(tenantId, filters) {
        const where = { tenantId, isActive: true };
        if (filters?.accountType && Object.values(client_1.AccountType).includes(filters.accountType)) {
            where.type = filters.accountType;
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
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance.toNumber(), 0);
        return {
            accounts,
            totalBalance,
            accountCount: accounts.length,
        };
    }
    async generateMonthlyAnalysis(tenantId, filters) {
        const year = typeof filters?.year === 'number'
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
            }
            else {
                monthlyData[month].expenses += amount;
            }
        });
        return {
            year,
            monthlyData,
            totalIncome: monthlyData.reduce((sum, month) => sum + month.income, 0),
            totalExpenses: monthlyData.reduce((sum, month) => sum + month.expenses, 0),
            totalTransactions: transactions.length,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map