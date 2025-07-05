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
var AdminController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let AdminController = AdminController_1 = class AdminController {
    adminService;
    logger = new common_1.Logger(AdminController_1.name);
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        try {
            return await this.adminService.getDashboardStats();
        }
        catch (error) {
            this.logger.error('Error in getDashboardStats', error.stack || error);
            throw error;
        }
    }
    async getSystemHealth() {
        try {
            return await this.adminService.getSystemHealth();
        }
        catch (error) {
            this.logger.error('Error in getSystemHealth', error.stack || error);
            throw error;
        }
    }
    async getAuditLogs(page = 1, limit = 50, search, action, entityType, userId) {
        try {
            return await this.adminService.getAuditLogs(Number(page), Number(limit), search, action, entityType, userId);
        }
        catch (error) {
            this.logger.error('Error in getAuditLogs', error.stack || error);
            throw error;
        }
    }
    async getGlobalKpis() {
        try {
            return await this.adminService.getGlobalKpis();
        }
        catch (error) {
            this.logger.error('Error in getGlobalKpis', error.stack || error);
            throw error;
        }
    }
    async getGlobalAnalytics() {
        try {
            return await this.adminService.getGlobalAnalytics();
        }
        catch (error) {
            this.logger.error('Error in getGlobalAnalytics', error.stack || error);
            throw error;
        }
    }
    async getGlobalSettings() {
        try {
            return await this.adminService.getGlobalSettings();
        }
        catch (error) {
            this.logger.error('Error in getGlobalSettings', error.stack || error);
            throw error;
        }
    }
    async updateGlobalSettings(data) {
        try {
            return await this.adminService.updateGlobalSettings(data);
        }
        catch (error) {
            this.logger.error('Error in updateGlobalSettings', error.stack || error);
            throw error;
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard statistics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System health status retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit logs retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)('entityType')),
    __param(5, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global KPIs for superadmin dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KPIs globaux retournés' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGlobalKpis", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global analytics for superadmin dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics globaux retournés' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGlobalAnalytics", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global platform settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global settings retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGlobalSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update global platform settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global settings updated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateGlobalSettings", null);
exports.AdminController = AdminController = AdminController_1 = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map