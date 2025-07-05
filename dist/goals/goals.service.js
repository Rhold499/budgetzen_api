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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plans_service_1 = require("../plans/plans.service");
const client_1 = require("@prisma/client");
let GoalsService = class GoalsService {
    prisma;
    plansService;
    constructor(prisma, plansService) {
        this.prisma = prisma;
        this.plansService = plansService;
    }
    async create(createGoalDto, tenantId, createdById) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        return this.prisma.goal.create({
            data: {
                ...createGoalDto,
                targetDate: createGoalDto.targetDate
                    ? new Date(createGoalDto.targetDate)
                    : null,
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
                _count: {
                    select: {
                        contributions: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId, status, priority) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        const where = { tenantId };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        const goals = await this.prisma.goal.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        contributions: true,
                    },
                },
            },
            orderBy: [
                { priority: 'asc' },
                { targetDate: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        return goals.map((goal) => {
            const progress = goal.targetAmount.toNumber() > 0
                ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100
                : 0;
            const isCompleted = goal.currentAmount.toNumber() >= goal.targetAmount.toNumber();
            const remaining = Math.max(0, goal.targetAmount.toNumber() - goal.currentAmount.toNumber());
            let daysRemaining = null;
            if (goal.targetDate) {
                const today = new Date();
                const target = new Date(goal.targetDate);
                daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }
            return {
                ...goal,
                progress,
                isCompleted,
                remaining,
                daysRemaining,
            };
        });
    }
    async findOne(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        const goal = await this.prisma.goal.findFirst({
            where: { id, tenantId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                contributions: {
                    include: {
                        transaction: {
                            select: {
                                id: true,
                                amount: true,
                                description: true,
                                createdAt: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        const progress = goal.targetAmount.toNumber() > 0
            ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100
            : 0;
        const isCompleted = goal.currentAmount.toNumber() >= goal.targetAmount.toNumber();
        const remaining = Math.max(0, goal.targetAmount.toNumber() - goal.currentAmount.toNumber());
        let daysRemaining = null;
        if (goal.targetDate) {
            const today = new Date();
            const target = new Date(goal.targetDate);
            daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
        return {
            ...goal,
            progress,
            isCompleted,
            remaining,
            daysRemaining,
        };
    }
    async update(id, updateGoalDto, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        const goal = await this.prisma.goal.findFirst({
            where: { id, tenantId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return this.prisma.goal.update({
            where: { id },
            data: {
                ...updateGoalDto,
                targetDate: updateGoalDto.targetDate
                    ? new Date(updateGoalDto.targetDate)
                    : undefined,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        contributions: true,
                    },
                },
            },
        });
    }
    async remove(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        const goal = await this.prisma.goal.findFirst({
            where: { id, tenantId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return this.prisma.goal.delete({
            where: { id },
        });
    }
    async addContribution(goalId, createContributionDto, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'project_goals');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Project goals feature not available in your current plan');
        }
        const goal = await this.prisma.goal.findFirst({
            where: { id: goalId, tenantId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        if (goal.status !== client_1.GoalStatus.ACTIVE) {
            throw new common_1.ForbiddenException('Cannot add contributions to inactive goals');
        }
        return this.prisma.$transaction(async (tx) => {
            const contribution = await tx.goalContribution.create({
                data: {
                    ...createContributionDto,
                    goalId,
                },
            });
            const newCurrentAmount = parseFloat(goal.currentAmount.toString()) + parseFloat(createContributionDto.amount);
            const updatedGoal = await tx.goal.update({
                where: { id: goalId },
                data: {
                    currentAmount: newCurrentAmount.toString(),
                    status: newCurrentAmount >= parseFloat(goal.targetAmount.toString())
                        ? client_1.GoalStatus.COMPLETED
                        : goal.status,
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
            return {
                contribution,
                goal: updatedGoal,
                isCompleted: newCurrentAmount >= parseFloat(goal.targetAmount.toString()),
            };
        });
    }
    async getContributions(goalId, tenantId) {
        const goal = await this.prisma.goal.findFirst({
            where: { id: goalId, tenantId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return this.prisma.goalContribution.findMany({
            where: { goalId },
            include: {
                transaction: {
                    select: {
                        id: true,
                        amount: true,
                        description: true,
                        createdAt: true,
                        createdBy: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getGoalStats(tenantId) {
        const [totalGoals, activeGoals, completedGoals, totalTargetAmount, totalCurrentAmount,] = await Promise.all([
            this.prisma.goal.count({ where: { tenantId } }),
            this.prisma.goal.count({
                where: { tenantId, status: client_1.GoalStatus.ACTIVE },
            }),
            this.prisma.goal.count({
                where: { tenantId, status: client_1.GoalStatus.COMPLETED },
            }),
            this.prisma.goal.aggregate({
                where: { tenantId },
                _sum: { targetAmount: true },
            }),
            this.prisma.goal.aggregate({
                where: { tenantId },
                _sum: { currentAmount: true },
            }),
        ]);
        const overallProgress = totalTargetAmount._sum.targetAmount?.toNumber() > 0
            ? ((totalCurrentAmount._sum.currentAmount?.toNumber() || 0) /
                totalTargetAmount._sum.targetAmount.toNumber()) *
                100
            : 0;
        return {
            totalGoals,
            activeGoals,
            completedGoals,
            totalTargetAmount: totalTargetAmount._sum.targetAmount || 0,
            totalCurrentAmount: totalCurrentAmount._sum.currentAmount || 0,
            overallProgress,
        };
    }
    async linkTransactionToGoal(transactionId, goalId, tenantId) {
        const [transaction, goal] = await Promise.all([
            this.prisma.transaction.findFirst({
                where: { id: transactionId, tenantId },
            }),
            this.prisma.goal.findFirst({
                where: { id: goalId, tenantId },
            }),
        ]);
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return this.addContribution(goalId, {
            amount: transaction.amount.toString(),
            description: `Linked from transaction: ${transaction.description || transaction.reference}`,
            transactionId,
        }, tenantId);
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map