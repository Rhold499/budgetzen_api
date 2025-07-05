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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        try {
            const [totalTenants, totalUsers, totalAccounts, totalTransactions, activeTenants, recentTransactions,] = await Promise.all([
                this.prisma.tenant.count(),
                this.prisma.user.count(),
                this.prisma.account.count(),
                this.prisma.transaction.count(),
                this.prisma.tenant.count({ where: { isActive: true } }),
                this.prisma.transaction.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        tenant: { select: { id: true, name: true } },
                        createdBy: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                }),
            ]);
            return {
                totals: {
                    tenants: totalTenants,
                    users: totalUsers,
                    accounts: totalAccounts,
                    transactions: totalTransactions,
                },
                activeTenants,
                recentTransactions,
            };
        }
        catch (error) {
            this.logger.error('Error in getDashboardStats', error?.stack ?? error);
            throw error;
        }
    }
    async getSystemHealth() {
        try {
            const [dbStatus, pendingTransactions, failedTransactions, inactiveUsers] = await Promise.all([
                this.checkDatabaseConnection(),
                this.prisma.transaction.count({ where: { status: 'PENDING' } }),
                this.prisma.transaction.count({ where: { status: 'FAILED' } }),
                this.prisma.user.count({ where: { isActive: false } }),
            ]);
            return {
                database: dbStatus,
                pendingTransactions,
                failedTransactions,
                inactiveUsers,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Error in getSystemHealth', error?.stack ?? error);
            throw error;
        }
    }
    async checkDatabaseConnection() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Error in checkDatabaseConnection', error?.stack ?? error);
            return false;
        }
    }
    async getAuditLogs(page = 1, limit = 50, search, action, entityType, userId) {
        try {
            const skip = (page - 1) * limit;
            const where = {};
            if (action)
                where.action = { equals: action, mode: 'insensitive' };
            if (entityType)
                where.entityType = { equals: entityType, mode: 'insensitive' };
            if (userId)
                where.userId = userId;
            if (search) {
                where.OR = [
                    { entityId: { contains: search, mode: 'insensitive' } },
                    { details: { contains: search, mode: 'insensitive' } },
                ];
            }
            const [logs, total] = await Promise.all([
                this.prisma.auditLog.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.auditLog.count({ where }),
            ]);
            return {
                data: logs,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error('Error in getAuditLogs', error?.stack ?? error);
            throw error;
        }
    }
    async getTenantAnalytics() {
        try {
            const [tenantsByPlan, tenantsByStatus, tenantGrowth] = await Promise.all([
                this.prisma.tenant.groupBy({
                    by: ['planType'],
                    _count: { planType: true },
                }),
                this.prisma.tenant.groupBy({
                    by: ['isActive'],
                    _count: { isActive: true },
                }),
                this.prisma.tenant.findMany({
                    select: {
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                }),
            ]);
            const monthlyGrowth = this.calculateMonthlyGrowth(tenantGrowth);
            return {
                byPlan: tenantsByPlan,
                byStatus: tenantsByStatus,
                monthlyGrowth,
            };
        }
        catch (error) {
            this.logger.error('Error in getTenantAnalytics', error?.stack ?? error);
            throw error;
        }
    }
    calculateMonthlyGrowth(tenants) {
        const monthlyData = new Map();
        tenants.forEach((tenant) => {
            const monthKey = tenant.createdAt.toISOString().slice(0, 7);
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
        });
        return Array.from(monthlyData.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
    async getGlobalKpis() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalTenants, totalUsers, totalAdmins, totalTransactions, volumeTransactionsValidees, tenantsCeMois, usersCeMois, membresParTenant, plans,] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.user.count(),
            this.prisma.userTenant.count({ where: { role: 'admin' } }),
            this.prisma.transaction.count(),
            this.prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { status: 'VALIDATED' },
            }),
            this.prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
            this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            this.prisma.userTenant.groupBy({
                by: ['tenantId'],
                _count: { userId: true },
            }),
            this.prisma.tenant.groupBy({
                by: ['planType'],
                _count: { planType: true },
            }),
        ]);
        const moyenneMembres = membresParTenant.length
            ? Math.round(membresParTenant.reduce((acc, t) => acc + t._count.userId, 0) /
                membresParTenant.length)
            : 0;
        return {
            totalTenants,
            totalUsers,
            totalAdmins,
            totalTransactions,
            volumeTransactionsValidees: volumeTransactionsValidees._sum.amount || 0,
            tenantsCeMois,
            usersCeMois,
            moyenneMembresParTenant: moyenneMembres,
            repartitionPlans: plans,
        };
    }
    async getGlobalAnalytics() {
        const tenants = await this.prisma.tenant.findMany({
            select: { createdAt: true },
        });
        const users = await this.prisma.user.findMany({
            select: { createdAt: true },
        });
        const monthlyGrowthMap = new Map();
        tenants.forEach((t) => {
            const month = t.createdAt.toISOString().slice(0, 7);
            if (!monthlyGrowthMap.has(month)) {
                monthlyGrowthMap.set(month, { tenants: 0, users: 0 });
            }
            const entry = monthlyGrowthMap.get(month);
            if (entry)
                entry.tenants++;
        });
        users.forEach((u) => {
            const month = u.createdAt.toISOString().slice(0, 7);
            if (!monthlyGrowthMap.has(month)) {
                monthlyGrowthMap.set(month, { tenants: 0, users: 0 });
            }
            const entry = monthlyGrowthMap.get(month);
            if (entry)
                entry.users++;
        });
        const monthlyGrowth = Array.from(monthlyGrowthMap.entries())
            .map(([month, value]) => ({
            month,
            tenants: value.tenants,
            users: value.users,
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        const transactions = await this.prisma.transaction.findMany({
            select: { createdAt: true, amount: true },
        });
        const transactionsByMonthMap = new Map();
        transactions.forEach((trx) => {
            const month = trx.createdAt.toISOString().slice(0, 7);
            if (!transactionsByMonthMap.has(month)) {
                transactionsByMonthMap.set(month, { count: 0, volume: 0 });
            }
            const entry = transactionsByMonthMap.get(month);
            if (entry) {
                entry.count++;
                entry.volume += Number(trx.amount);
            }
        });
        const transactionsByMonth = Array.from(transactionsByMonthMap.entries())
            .map(([month, value]) => ({
            month,
            count: value.count,
            volume: value.volume,
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        const spendingRaw = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            _sum: { amount: true },
            where: { type: 'DEBIT', status: 'VALIDATED', categoryId: { not: null } },
        });
        const categories = await this.prisma.category.findMany({
            select: { id: true, name: true },
        });
        const spendingByCategory = spendingRaw.map((s) => {
            const cat = categories.find((c) => c.id === s.categoryId);
            return {
                category: cat?.name || 'Inconnu',
                amount: Math.abs(Number(s._sum.amount) || 0),
            };
        });
        const goals = await this.prisma.goal.findMany({
            select: { status: true, updatedAt: true },
        });
        const goalsAchievedMap = new Map();
        goals.forEach((g) => {
            if (g.status === 'COMPLETED') {
                const month = g.updatedAt.toISOString().slice(0, 7);
                goalsAchievedMap.set(month, (goalsAchievedMap.get(month) || 0) + 1);
            }
        });
        const goalsAchieved = Array.from(goalsAchievedMap.entries())
            .map(([month, achieved]) => ({ month, achieved }))
            .sort((a, b) => a.month.localeCompare(b.month));
        const tenantsList = await this.prisma.tenant.findMany({
            select: { id: true, name: true, planType: true },
        });
        const usersByTenant = await this.prisma.user.groupBy({
            by: ['tenantId'],
            _count: { tenantId: true },
        });
        const transactionsByTenant = await this.prisma.transaction.groupBy({
            by: ['tenantId'],
            _count: { tenantId: true },
        });
        const topTenants = tenantsList
            .map((t) => {
            const users = usersByTenant.find((u) => u.tenantId === t.id)?._count.tenantId || 0;
            const transactions = transactionsByTenant.find((tr) => tr.tenantId === t.id)?._count
                .tenantId || 0;
            return {
                name: t.name,
                users,
                transactions,
                plan: t.planType,
            };
        })
            .sort((a, b) => b.transactions - a.transactions)
            .slice(0, 10);
        return {
            monthlyGrowth,
            transactionsByMonth,
            spendingByCategory,
            goalsAchieved,
            topTenants,
        };
    }
    async getGlobalSettings() {
        const settings = await this.prisma.globalSetting.findUnique({ where: { id: 'global' } });
        if (!settings) {
            return await this.prisma.globalSetting.create({
                data: {
                    id: 'global',
                    emailTemplates: {},
                    securityRules: {},
                    features: {},
                    systemSettings: {},
                },
            });
        }
        return {
            emailTemplates: settings.emailTemplates || {},
            securityRules: settings.securityRules || {},
            features: settings.features || {},
        };
    }
    async updateGlobalSettings(data) {
        const allowedFields = ['emailTemplates', 'securityRules', 'features'];
        const updateData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                updateData[key] = data[key];
            }
        }
        const updated = await this.prisma.globalSetting.update({
            where: { id: 'global' },
            data: updateData,
        });
        return {
            emailTemplates: updated.emailTemplates || {},
            securityRules: updated.securityRules || {},
            features: updated.features || {},
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map