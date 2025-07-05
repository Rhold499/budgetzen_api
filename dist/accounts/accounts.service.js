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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plans_service_1 = require("../plans/plans.service");
let AccountsService = class AccountsService {
    prisma;
    plansService;
    constructor(prisma, plansService) {
        this.prisma = prisma;
        this.plansService = plansService;
    }
    async create(createAccountDto, tenantId, ownerId) {
        const canAddAccount = await this.plansService.checkPlanLimits(tenantId, 'accounts');
        if (!canAddAccount) {
            throw new common_1.ForbiddenException('Account limit reached for your current plan');
        }
        const account = await this.prisma.account.create({
            data: {
                ...createAccountDto,
                tenantId,
                ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
        if (user?.role !== 'SUPERADMIN') {
            const defaultCategories = [
                { name: 'Alimentation', description: 'Courses, restaurants, nourriture', color: '#10B981', icon: '🍽️', type: 'EXPENSE' },
                { name: 'Transport', description: 'Carburant, transports publics, véhicule', color: '#3B82F6', icon: '🚗', type: 'EXPENSE' },
                { name: 'Logement', description: 'Loyer, charges, entretien', color: '#8B5CF6', icon: '🏠', type: 'EXPENSE' },
                { name: 'Santé', description: 'Médecin, pharmacie, assurance santé', color: '#EF4444', icon: '⚕️', type: 'EXPENSE' },
                { name: 'Loisirs', description: 'Sorties, hobbies, vacances', color: '#F59E0B', icon: '🎉', type: 'EXPENSE' },
                { name: 'Éducation', description: 'Formation, livres, cours', color: '#06B6D4', icon: '📚', type: 'EXPENSE' },
                { name: 'Salaire', description: 'Revenus du travail', color: '#10B981', icon: '💰', type: 'INCOME' },
                { name: 'Investissements', description: 'Dividendes, plus-values', color: '#8B5CF6', icon: '📈', type: 'INCOME' },
                { name: 'Autres revenus', description: 'Revenus divers', color: '#6B7280', icon: '💼', type: 'INCOME' },
                { name: 'Épargne', description: 'Mise de côté, placements', color: '#059669', icon: '🏦', type: 'BOTH' },
            ];
            const existingCategories = await this.prisma.category.findMany({
                where: { tenantId },
                select: { name: true },
            });
            const existingNames = new Set(existingCategories.map(c => c.name));
            for (const cat of defaultCategories) {
                if (!existingNames.has(cat.name)) {
                    await this.prisma.category.create({
                        data: {
                            ...cat,
                            tenantId,
                            createdById: ownerId,
                            isActive: true,
                            type: cat.type,
                        },
                    });
                }
            }
        }
        return account;
    }
    async findAll(tenantId, page = 1, limit = 10, ownerId, userRole) {
        const skip = (page - 1) * limit;
        const where = tenantId ? { tenantId } : {};
        if (ownerId) {
            where.ownerId = ownerId;
        }
        const [accounts, total] = await Promise.all([
            this.prisma.account.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            debitTransactions: true,
                            creditTransactions: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.account.count({ where }),
        ]);
        return {
            data: accounts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, tenantId, userRole, userId) {
        const account = await this.prisma.account.findFirst({
            where: { id, tenantId },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        debitTransactions: true,
                        creditTransactions: true,
                    },
                },
            },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        if (userRole !== 'SUPERADMIN' &&
            userRole !== 'ADMIN' &&
            account.ownerId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return account;
    }
    async update(id, updateAccountDto, tenantId, userRole, userId) {
        const account = await this.prisma.account.findFirst({
            where: { id, tenantId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        if (userRole !== 'SUPERADMIN' &&
            userRole !== 'ADMIN' &&
            account.ownerId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.account.update({
            where: { id },
            data: updateAccountDto,
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, tenantId, userRole, userId) {
        const account = await this.prisma.account.findFirst({
            where: { id, tenantId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        if (userRole !== 'SUPERADMIN' &&
            userRole !== 'ADMIN' &&
            account.ownerId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const transactionCount = await this.prisma.transaction.count({
            where: {
                OR: [{ debitAccountId: id }, { creditAccountId: id }],
            },
        });
        if (transactionCount > 0) {
            throw new common_1.ForbiddenException('Cannot delete account with existing transactions');
        }
        return this.prisma.account.delete({
            where: { id },
        });
    }
    async getBalance(id, tenantId) {
        const account = await this.prisma.account.findFirst({
            where: { id, tenantId },
            select: { balance: true, currency: true },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async getTransactionHistory(id, tenantId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: {
                    tenantId,
                    OR: [{ debitAccountId: id }, { creditAccountId: id }],
                },
                include: {
                    debitAccount: {
                        select: { id: true, name: true },
                    },
                    creditAccount: {
                        select: { id: true, name: true },
                    },
                    createdBy: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transaction.count({
                where: {
                    tenantId,
                    OR: [{ debitAccountId: id }, { creditAccountId: id }],
                },
            }),
        ]);
        return {
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map