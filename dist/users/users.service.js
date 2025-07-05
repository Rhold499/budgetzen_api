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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const plans_service_1 = require("../plans/plans.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    prisma;
    plansService;
    webhooksService;
    jwtService;
    constructor(prisma, plansService, webhooksService, jwtService) {
        this.prisma = prisma;
        this.plansService = plansService;
        this.webhooksService = webhooksService;
        this.jwtService = jwtService;
    }
    async create(createUserDto, tenantId) {
        try {
            const canAddUser = await this.plansService.checkPlanLimits(tenantId, 'users');
            if (!canAddUser) {
                throw new common_1.ForbiddenException('User limit reached for your current plan');
            }
            let hashedPassword = '';
            if (createUserDto.password) {
                hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            }
            const user = await this.prisma.user.create({
                data: {
                    email: createUserDto.email,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    role: createUserDto.role || 'USER',
                    isActive: typeof createUserDto.isActive === 'boolean'
                        ? createUserDto.isActive
                        : true,
                    tenantId: createUserDto.tenantId || tenantId,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    tenantId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            await this.webhooksService.onUserCreated(user);
            await this.prisma.auditLog.create({
                data: {
                    action: 'USER_CREATED',
                    entityType: 'User',
                    entityId: user.id,
                    newValues: user,
                },
            });
            return user;
        }
        catch (error) {
            console.error("Erreur lors de la création d'un utilisateur:", error);
            throw error;
        }
    }
    async findAll(tenantId, page = 1, limit = 10, role, search, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (tenantId) {
            where.tenantId = tenantId;
        }
        if (role) {
            where.role = role;
        }
        if (typeof isActive === 'string' && ['true', 'false'].includes(isActive)) {
            where.isActive = isActive === 'true';
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, tenantId, role) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                tenantId: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (role !== 'SUPERADMIN' && tenantId && user.tenantId !== tenantId) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true,
            },
        });
    }
    async update(id, updateUserDto, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'USER_UPDATED',
                entityType: 'User',
                entityId: updatedUser.id,
                newValues: updatedUser,
            },
        });
        return updatedUser;
    }
    async remove(id, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const deletedUser = await this.prisma.user.delete({
            where: { id },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'USER_DELETED',
                entityType: 'User',
                entityId: deletedUser.id,
                oldValues: deletedUser,
                userId: null,
            },
        });
        return deletedUser;
    }
    async inviteUserToTenant(dto, tenantId, inviterId) {
        let user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    isActive: false,
                    password: '',
                    firstName: dto.firstName || 'Invited',
                    lastName: dto.lastName || 'User',
                    tenantId: tenantId,
                },
            });
        }
        await this.prisma.userTenant.upsert({
            where: { userId_tenantId: { userId: user.id, tenantId } },
            update: { role: dto.role || 'MEMBER', status: 'pending' },
            create: {
                userId: user.id,
                tenantId,
                role: dto.role || 'MEMBER',
                status: 'pending',
            },
        });
        const payload = {
            email: user.email,
            tenantId,
            role: dto.role || 'MEMBER',
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        };
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
        });
        const link = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
        return { link };
    }
    async getUserTenants(userId) {
        return this.prisma.userTenant.findMany({
            where: { userId, status: 'active' },
            include: { tenant: true },
        });
    }
    async switchTenant(userId, tenantId) {
        const link = await this.prisma.userTenant.findUnique({
            where: { userId_tenantId: { userId, tenantId } },
        });
        if (!link || link.status !== 'active')
            throw new common_1.ForbiddenException('Not allowed');
        return { message: 'Tenant switched', tenantId };
    }
    async getUserLogs(userId, requesterRole, requesterTenantId) {
        if (requesterRole !== 'SUPERADMIN') {
            const targetUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { tenantId: true },
            });
            if (!targetUser || targetUser.tenantId !== requesterTenantId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return this.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plans_service_1.PlansService,
        webhooks_service_1.WebhooksService,
        jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map