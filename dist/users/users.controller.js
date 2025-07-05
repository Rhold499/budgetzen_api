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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
const invite_user_dto_1 = require("./dto/invite-user.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto, tenant) {
        try {
            return await this.usersService.create(createUserDto, tenant.id);
        }
        catch (error) {
            console.error('Erreur dans /users (POST):', error);
            return {
                statusCode: error.status || 500,
                message: error.message || 'Internal server error',
            };
        }
    }
    async findAll(query, tenant, user) {
        try {
            const { page = 1, limit = 10, role, search, isActive } = query;
            if (tenant && tenant.id) {
                return this.usersService.findAll(tenant.id, Number(page), Number(limit), role, search, isActive);
            }
            if (user.role === 'SUPERADMIN' && query.tenantId) {
                return {
                    statusCode: 404,
                    message: 'Le tenant spécifié est introuvable ou inactif.',
                };
            }
            if (user.role === 'SUPERADMIN') {
                return this.usersService.findAll(undefined, Number(page), Number(limit), role, search, isActive);
            }
            return {
                statusCode: 403,
                message: 'Tenant context is required to list users.',
            };
        }
        catch (error) {
            console.error('Erreur dans /users:', error);
            return {
                statusCode: 500,
                message: error.message || 'Internal server error',
            };
        }
    }
    getProfile(user) {
        return this.usersService.findById(user.id);
    }
    findOne(id, tenant, user) {
        return this.usersService.findById(id, tenant?.id, user?.role);
    }
    update(id, updateUserDto, tenant) {
        return this.usersService.update(id, updateUserDto, tenant.id);
    }
    remove(id, tenant) {
        return this.usersService.remove(id, tenant.id);
    }
    async invite(inviteUserDto, tenant, inviter) {
        return this.usersService.inviteUserToTenant(inviteUserDto, tenant.id, inviter.id);
    }
    async getMyTenants(user) {
        return this.usersService.getUserTenants(user.id);
    }
    async switchTenant(user, body) {
        return this.usersService.switchTenant(user.id, body.tenantId);
    }
    async getUserLogs(id, user) {
        const logs = await this.usersService.getUserLogs(id, user.role, user.tenantId);
        return { data: logs };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users',
        description: 'Le contexte tenant doit être transmis via le header x-tenant-id (et non dans l’URL). Ne pas utiliser ?tenantId=... dans la query.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
    }),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Invite a user to the tenant',
        description: 'Invite an existing or new user to join the current tenant. Envoie un lien sécurisé par email.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invitation link generated' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_user_dto_1.InviteUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "invite", null);
__decorate([
    (0, common_1.Get)('/me/tenants'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all tenants for the current user',
        description: 'Retourne la liste des organisations auxquelles l’utilisateur appartient.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tenants' }),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyTenants", null);
__decorate([
    (0, common_1.Patch)('/me/tenant'),
    (0, swagger_1.ApiOperation)({
        summary: 'Switch active tenant',
        description: 'Change le tenant actif de l’utilisateur (pour le multi-tenant).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant switched' }),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "switchTenant", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logs retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserLogs", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map