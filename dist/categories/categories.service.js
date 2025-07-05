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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plans_service_1 = require("../plans/plans.service");
let CategoriesService = class CategoriesService {
    prisma;
    plansService;
    constructor(prisma, plansService) {
        this.prisma = prisma;
        this.plansService = plansService;
    }
    async create(createCategoryDto, tenantId, createdById) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'category_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Category management feature not available in your current plan');
        }
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                tenantId,
                name: createCategoryDto.name,
            },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        return this.prisma.category.create({
            data: {
                ...createCategoryDto,
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
                        transactions: true,
                        budgets: true,
                    },
                },
            },
        });
    }
    async findAll(tenantId, type, isActive, userRole) {
        if (userRole !== 'SUPERADMIN') {
            const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'category_management');
            if (!hasFeature) {
                throw new common_1.ForbiddenException('Category management feature not available in your current plan');
            }
        }
        const where = userRole === 'SUPERADMIN' ? {} : { tenantId };
        if (type) {
            where.OR = [{ type }, { type: 'BOTH' }];
        }
        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }
        return this.prisma.category.findMany({
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
                        transactions: true,
                        budgets: true,
                    },
                },
            },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    async findOne(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'category_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Category management feature not available in your current plan');
        }
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
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
                        transactions: true,
                        budgets: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async update(id, updateCategoryDto, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'category_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Category management feature not available in your current plan');
        }
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existingCategory = await this.prisma.category.findFirst({
                where: {
                    tenantId,
                    name: updateCategoryDto.name,
                    id: { not: id },
                },
            });
            if (existingCategory) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
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
                        transactions: true,
                        budgets: true,
                    },
                },
            },
        });
    }
    async remove(id, tenantId) {
        const hasFeature = await this.plansService.validatePlanFeature(tenantId, 'category_management');
        if (!hasFeature) {
            throw new common_1.ForbiddenException('Category management feature not available in your current plan');
        }
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const usage = await this.prisma.category.findFirst({
            where: { id },
            include: {
                _count: {
                    select: {
                        transactions: true,
                        budgets: true,
                    },
                },
            },
        });
        if (usage && (usage._count.transactions > 0 || usage._count.budgets > 0)) {
            return this.prisma.category.update({
                where: { id },
                data: { isActive: false },
            });
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
    async getStats(tenantId, categoryId) {
        const where = {
            tenantId,
            status: 'VALIDATED',
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const [totalTransactions, totalAmount, monthlyStats] = await Promise.all([
            this.prisma.transaction.count({ where }),
            this.prisma.transaction.aggregate({
                where,
                _sum: { amount: true },
            }),
            this.prisma.transaction.groupBy({
                by: ['categoryId'],
                where,
                _count: { categoryId: true },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalTransactions,
            totalAmount: totalAmount._sum.amount || 0,
            monthlyStats,
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map