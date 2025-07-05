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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("../transactions/transactions.service");
const accounts_service_1 = require("../accounts/accounts.service");
let MobileService = class MobileService {
    prisma;
    transactionsService;
    accountsService;
    constructor(prisma, transactionsService, accountsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
        this.accountsService = accountsService;
    }
    async getMobileDashboard(tenantId, userId) {
        const [accounts, recentTransactions, monthlyStats] = await Promise.all([
            this.getMobileAccounts(tenantId, userId),
            this.getRecentTransactions(tenantId, 10),
            this.getMonthlyStats(tenantId),
        ]);
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
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
    async getMobileAccounts(tenantId, userId) {
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
                balance: account.balance instanceof Object &&
                    typeof account.balance.toNumber === 'function'
                    ? account.balance.toNumber()
                    : Number(account.balance),
                currency: account.currency,
                transactionCount: (account._count?.debitTransactions || 0) +
                    (account._count?.creditTransactions || 0),
            };
        });
    }
    async getMobileTransactions(tenantId, page = 1, limit = 20, accountId) {
        const skip = (page - 1) * limit;
        const where = { tenantId };
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
            take: limit + 1,
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
                accountName: transaction.debitAccount?.name || transaction.creditAccount?.name,
                category: typeof transaction.metadata === 'object' &&
                    transaction.metadata !== null &&
                    'category' in transaction.metadata
                    ? transaction.metadata.category
                    : undefined,
                receiptUrl: transaction.receiptUrl,
            })),
            hasMore,
        };
    }
    async createQuickTransaction(tenantId, userId, data) {
        const transaction = await this.transactionsService.create({
            amount: String(data.amount),
            type: data.type,
            description: data.description,
            debitAccountId: data.type === 'DEBIT' ? data.accountId : undefined,
            creditAccountId: data.type === 'CREDIT' ? data.accountId : undefined,
            metadata: data.category ? { category: data.category } : undefined,
        }, tenantId, userId);
        return {
            id: transaction.id,
            amount: transaction.amount.toNumber(),
            type: transaction.type,
            description: transaction.description || '',
            date: transaction.createdAt.toISOString(),
            status: transaction.status,
            category: typeof transaction.metadata === 'object' &&
                transaction.metadata !== null &&
                'category' in transaction.metadata
                ? transaction.metadata.category
                : undefined,
        };
    }
    async getAccountBalance(tenantId, accountId) {
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
    async searchTransactions(tenantId, query, limit = 10) {
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
            accountName: transaction.debitAccount?.name || transaction.creditAccount?.name,
            category: typeof transaction.metadata === 'object' &&
                transaction.metadata !== null &&
                'category' in transaction.metadata
                ? transaction.metadata.category
                : undefined,
        }));
    }
    async getRecentTransactions(tenantId, limit) {
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
            accountName: transaction.debitAccount?.name || transaction.creditAccount?.name,
            category: typeof transaction.metadata === 'object' &&
                transaction.metadata !== null &&
                'category' in transaction.metadata
                ? transaction.metadata.category
                : undefined,
        }));
    }
    async getMonthlyStats(tenantId) {
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
        const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
        const averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;
        return {
            income,
            expenses,
            pendingCount,
            totalCount: transactions.length,
            averageAmount,
        };
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.TransactionsService,
        accounts_service_1.AccountsService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map