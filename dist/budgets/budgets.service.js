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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plans_service_1 = require("../plans/plans.service");
let BudgetsService = class BudgetsService {
    prisma;
    plansService;
    constructor(prisma, plansService) {
        this.prisma = prisma;
        this.plansService = plansService;
    }
    async create(createBudgetDto, tenantId, createdById) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'budget_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Budget management feature not available in your current plan');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planType: true },
        });
        if (tenant?.planType === 'FAMILY') {
            const existingBudgets = await this.prisma.budget.count({
                where: { tenantId, isActive: true },
            });
            if (existingBudgets >= 5) {
                throw new common_1.ForbiddenException('Budget limit reached for Family plan (5 categories max)');
            }
        }
        const existingBudget = await this.prisma.budget.findFirst({
            where: {
                tenantId,
                categoryId: createBudgetDto.categoryId,
                month: createBudgetDto.month,
                year: createBudgetDto.year,
            },
        });
        if (existingBudget) {
            throw new common_1.ConflictException('Budget already exists for this category and period');
        }
        const category = await this.prisma.category.findFirst({
            where: {
                id: createBudgetDto.categoryId,
                tenantId,
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const spent = await this.calculateSpentAmount(tenantId, createBudgetDto.categoryId, createBudgetDto.month, createBudgetDto.year);
        return this.prisma.budget.create({
            data: {
                ...createBudgetDto,
                spent,
                tenantId,
                createdById,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        type: true,
                    },
                },
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
    async findAll(tenantId, month, year, categoryId, userRole) {
        if (userRole !== 'SUPERADMIN') {
            const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'budget_management');
            if (!hasFeature) {
                throw new common_1.ForbiddenException('Budget management feature not available in your current plan');
            }
        }
        const where = userRole === 'SUPERADMIN'
            ? { isActive: true }
            : { tenantId, isActive: true };
        if (month)
            where.month = month;
        if (year)
            where.year = year;
        if (categoryId)
            where.categoryId = categoryId;
        const budgets = await this.prisma.budget.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        type: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
        return budgets;
    }
    async findOne(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'budget_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Budget management feature not available in your current plan');
        }
        const budget = await this.prisma.budget.findFirst({
            where: { id, tenantId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        type: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        const recentTransactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                categoryId: budget.categoryId,
                status: 'VALIDATED',
                createdAt: {
                    gte: new Date(budget.year, budget.month - 1, 1),
                    lt: new Date(budget.year, budget.month, 1),
                },
            },
            include: {
                debitAccount: { select: { name: true } },
                creditAccount: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const progress = budget.amount.toNumber() > 0
            ? (budget.spent.toNumber() / budget.amount.toNumber()) * 100
            : 0;
        return {
            ...budget,
            progress,
            isOverBudget: budget.spent.toNumber() > budget.amount.toNumber(),
            isNearLimit: budget.alertAt
                ? progress >= budget.alertAt.toNumber() * 100
                : false,
            remaining: Math.max(0, budget.amount.toNumber() - budget.spent.toNumber()),
            recentTransactions,
        };
    }
    async update(id, updateBudgetDto, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'budget_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Budget management feature not available in your current plan');
        }
        const budget = await this.prisma.budget.findFirst({
            where: { id, tenantId },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        if (updateBudgetDto.categoryId ||
            updateBudgetDto.month ||
            updateBudgetDto.year) {
            const categoryId = updateBudgetDto.categoryId || budget.categoryId;
            const month = updateBudgetDto.month || budget.month;
            const year = updateBudgetDto.year || budget.year;
            const existingBudget = await this.prisma.budget.findFirst({
                where: {
                    tenantId,
                    categoryId,
                    month,
                    year,
                    id: { not: id },
                },
            });
            if (existingBudget) {
                throw new common_1.ConflictException('Budget already exists for this category and period');
            }
        }
        let spent = budget.spent.toNumber();
        if (updateBudgetDto.categoryId ||
            updateBudgetDto.month ||
            updateBudgetDto.year) {
            spent = await this.calculateSpentAmount(tenantId, updateBudgetDto.categoryId || budget.categoryId, updateBudgetDto.month || budget.month, updateBudgetDto.year || budget.year);
        }
        return this.prisma.budget.update({
            where: { id },
            data: {
                ...updateBudgetDto,
                spent,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                        type: true,
                    },
                },
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
    async remove(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'budget_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Budget management feature not available in your current plan');
        }
        const budget = await this.prisma.budget.findFirst({
            where: { id, tenantId },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        return this.prisma.budget.delete({
            where: { id },
        });
    }
    async updateSpentAmounts(tenantId, categoryId, transactionDate) {
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();
        const budget = await this.prisma.budget.findFirst({
            where: {
                tenantId,
                categoryId,
                month,
                year,
                isActive: true,
            },
        });
        if (budget) {
            const spent = await this.calculateSpentAmount(tenantId, categoryId, month, year);
            await this.prisma.budget.update({
                where: { id: budget.id },
                data: { spent },
            });
            const progress = budget.amount.toNumber() > 0 ? spent / budget.amount.toNumber() : 0;
            if (budget.alertAt && progress >= budget.alertAt.toNumber()) {
                console.log(`Budget alert: ${budget.categoryId} is at ${(progress * 100).toFixed(1)}% of budget`);
            }
        }
    }
    async getBudgetSummary(tenantId, month, year) {
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();
        const budgets = await this.findAll(tenantId, targetMonth, targetYear);
        const summary = budgets.reduce((acc, budget) => {
            acc.totalBudget += budget.amount.toNumber();
            acc.totalSpent += budget.spent.toNumber();
            const isOverBudget = budget.spent.toNumber() > budget.amount.toNumber();
            const isNearLimit = !isOverBudget &&
                budget.spent.toNumber() > 0.9 * budget.amount.toNumber();
            if (isOverBudget) {
                acc.overBudgetCount++;
            }
            if (isNearLimit) {
                acc.nearLimitCount++;
            }
            return acc;
        }, {
            totalBudget: 0,
            totalSpent: 0,
            overBudgetCount: 0,
            nearLimitCount: 0,
        });
        summary['remaining'] = Math.max(0, summary.totalBudget - summary.totalSpent);
        summary['progress'] =
            summary.totalBudget > 0
                ? (summary.totalSpent / summary.totalBudget) * 100
                : 0;
        return {
            summary,
            budgets,
            period: { month: targetMonth, year: targetYear },
        };
    }
    async calculateSpentAmount(tenantId, categoryId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const result = await this.prisma.transaction.aggregate({
            where: {
                tenantId,
                categoryId,
                status: 'VALIDATED',
                type: { in: ['DEBIT', 'WITHDRAWAL', 'PAYMENT'] },
                createdAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            _sum: { amount: true },
        });
        return result._sum.amount?.toNumber() || 0;
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map