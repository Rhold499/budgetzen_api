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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let AiService = class AiService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async analyzeTransactions(tenantId, dateFrom, dateTo) {
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
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0);
        const avgTransaction = totalAmount / transactions.length || 0;
        const typeDistribution = transactions.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + t.amount.toNumber();
            return acc;
        }, {});
        const riskScore = this.calculateRiskScore(transactions, avgTransaction);
        return {
            summary: `Analyzed ${transactions.length} transactions totaling €${totalAmount.toFixed(2)}`,
            insights: [
                `Average transaction: €${avgTransaction.toFixed(2)}`,
                `Most common transaction type: ${Object.keys(typeDistribution)[0] || 'N/A'}`,
                `Transaction frequency: ${(transactions.length / 30).toFixed(1)} per day`,
            ],
            recommendations: this.generateRecommendations(transactions, typeDistribution),
            riskScore,
            categories: typeDistribution,
        };
    }
    async generateMonthlyInsights(tenantId, year) {
        const insights = [];
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
    async generateSmartRecommendations(tenantId) {
        const recentTransactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: 'VALIDATED',
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        });
        const accounts = await this.prisma.account.findMany({
            where: { tenantId },
        });
        const recommendations = [];
        const lowBalanceAccounts = accounts.filter((a) => a.balance.toNumber() < 100);
        if (lowBalanceAccounts.length > 0) {
            recommendations.push(`Warning: ${lowBalanceAccounts.length} account(s) have low balance`);
        }
        const totalSpending = recentTransactions
            .filter((t) => ['DEBIT', 'WITHDRAWAL', 'PAYMENT'].includes(t.type))
            .reduce((sum, t) => sum + t.amount.toNumber(), 0);
        if (totalSpending > 5000) {
            recommendations.push('High spending detected this month. Consider reviewing your expenses.');
        }
        const totalIncome = recentTransactions
            .filter((t) => ['CREDIT', 'DEPOSIT'].includes(t.type))
            .reduce((sum, t) => sum + t.amount.toNumber(), 0);
        const savingsRate = (totalIncome - totalSpending) / totalIncome;
        if (savingsRate < 0.2) {
            recommendations.push('Consider increasing your savings rate to at least 20% of income.');
        }
        return recommendations;
    }
    calculateRiskScore(transactions, avgTransaction) {
        let riskScore = 0;
        const largeTransactions = transactions.filter((t) => t.amount.toNumber() > avgTransaction * 3);
        riskScore += largeTransactions.length * 10;
        const smallFrequentTransactions = transactions.filter((t) => t.amount.toNumber() < avgTransaction * 0.1);
        if (smallFrequentTransactions.length > transactions.length * 0.5) {
            riskScore += 20;
        }
        return Math.min(100, riskScore);
    }
    generateRecommendations(transactions, typeDistribution) {
        const recommendations = [];
        if (typeDistribution['PAYMENT'] > typeDistribution['DEPOSIT']) {
            recommendations.push('Consider reviewing your payment patterns to optimize cash flow');
        }
        if (Object.keys(typeDistribution).length < 3) {
            recommendations.push('Consider diversifying your transaction types for better financial health');
        }
        if (!typeDistribution['DEPOSIT'] ||
            typeDistribution['DEPOSIT'] < typeDistribution['WITHDRAWAL']) {
            recommendations.push('Establish regular deposit patterns to improve your financial stability');
        }
        return recommendations;
    }
    detectUnusualTransactions(transactions) {
        if (transactions.length === 0)
            return [];
        const amounts = transactions.map((t) => t.amount.toNumber());
        const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const threshold = avgAmount * 3;
        return transactions.filter((t) => t.amount.toNumber() > threshold);
    }
    getTopCategories(transactions) {
        const categories = transactions.reduce((acc, t) => {
            const category = t.metadata?.category || t.type;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(categories)
            .sort(([, a], [, b]) => (typeof b === 'number' ? b : Number(b)) -
            (typeof a === 'number' ? a : Number(a)))
            .slice(0, 3)
            .map(([category]) => category);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map