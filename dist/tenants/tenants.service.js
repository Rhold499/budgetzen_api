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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const DEFAULT_CATEGORIES = [
    {
        name: 'Alimentation',
        description: 'Courses, restaurants, nourriture',
        color: '#10B981',
        icon: '🍽️',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Transport',
        description: 'Carburant, transports publics, véhicule',
        color: '#3B82F6',
        icon: '🚗',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Logement',
        description: 'Loyer, charges, entretien',
        color: '#8B5CF6',
        icon: '🏠',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Santé',
        description: 'Médecin, pharmacie, assurance santé',
        color: '#EF4444',
        icon: '⚕️',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Loisirs',
        description: 'Sorties, hobbies, vacances',
        color: '#F59E0B',
        icon: '🎉',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Éducation',
        description: 'Formation, livres, cours',
        color: '#06B6D4',
        icon: '📚',
        type: client_1.CategoryType.EXPENSE,
    },
    {
        name: 'Salaire',
        description: 'Revenus du travail',
        color: '#10B981',
        icon: '💰',
        type: client_1.CategoryType.INCOME,
    },
    {
        name: 'Investissements',
        description: 'Dividendes, plus-values',
        color: '#8B5CF6',
        icon: '📈',
        type: client_1.CategoryType.INCOME,
    },
    {
        name: 'Autres revenus',
        description: 'Revenus divers',
        color: '#6B7280',
        icon: '💼',
        type: client_1.CategoryType.INCOME,
    },
    {
        name: 'Épargne',
        description: 'Mise de côté, placements',
        color: '#059669',
        icon: '🏦',
        type: client_1.CategoryType.BOTH,
    },
];
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTenantDto) {
        const tenant = await this.prisma.tenant.create({
            data: createTenantDto,
        });
        await Promise.all(DEFAULT_CATEGORIES.map((cat) => this.prisma.category.create({
            data: {
                ...cat,
                tenantId: tenant.id,
                isDefault: true,
                createdById: null,
            },
        })));
        return tenant;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [tenants, total] = await Promise.all([
            this.prisma.tenant.findMany({
                include: {
                    _count: {
                        select: {
                            users: true,
                            accounts: true,
                            transactions: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tenant.count(),
        ]);
        return {
            data: tenants,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userRole, userTenantId) {
        if (userRole !== 'SUPERADMIN' && userTenantId !== id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        accounts: true,
                        transactions: true,
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async update(id, updateTenantDto, userRole, userTenantId) {
        if (userRole !== 'SUPERADMIN' && userRole !== 'ADMIN' && userRole !== 'USER') {
            throw new common_1.ForbiddenException('Access denied');
        }
        if ((userRole === 'ADMIN' || userRole === 'USER') && userTenantId !== id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return this.prisma.tenant.update({
            where: { id },
            data: updateTenantDto,
        });
    }
    async remove(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return this.prisma.tenant.delete({
            where: { id },
        });
    }
    async getStats(tenantId) {
        const [userCount, accountCount, transactionCount, totalBalance] = await Promise.all([
            this.prisma.user.count({ where: { tenantId } }),
            this.prisma.account.count({ where: { tenantId } }),
            this.prisma.transaction.count({ where: { tenantId } }),
            this.prisma.account.aggregate({
                where: { tenantId },
                _sum: { balance: true },
            }),
        ]);
        return {
            users: userCount,
            accounts: accountCount,
            transactions: transactionCount,
            totalBalance: totalBalance._sum.balance || 0,
        };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map