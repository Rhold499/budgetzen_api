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
exports.PlansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const plans_service_1 = require("./plans.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
const user_decorator_1 = require("../common/decorators/user.decorator");
let PlansController = class PlansController {
    plansService;
    constructor(plansService) {
        this.plansService = plansService;
    }
    async getCurrentPlanLimits(tenant) {
        return this.plansService.getPlanLimits(tenant.planType);
    }
    async checkResourceLimit(resource, tenant) {
        const canAdd = await this.plansService.checkPlanLimits(tenant.id, resource);
        return { canAdd, resource };
    }
    async upgradePlan(planType, tenant, user) {
        await this.plansService.upgradePlan(tenant.id, planType, user.id);
        return { message: 'Plan upgraded successfully', newPlan: planType };
    }
    async getAllPlans() {
        return this.plansService.getAllPlans();
    }
};
exports.PlansController = PlansController;
__decorate([
    (0, common_1.Get)('current/limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current plan limits' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plan limits', type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "getCurrentPlanLimits", null);
__decorate([
    (0, common_1.Get)('check/:resource'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if resource limit is reached' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resource limit check completed' }),
    __param(0, (0, common_1.Param)('resource')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "checkResourceLimit", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Upgrade plan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plan upgraded successfully' }),
    __param(0, (0, common_1.Body)('planType')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "upgradePlan", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available plans' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "getAllPlans", null);
exports.PlansController = PlansController = __decorate([
    (0, swagger_1.ApiTags)('plans'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('plans'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [plans_service_1.PlansService])
], PlansController);
//# sourceMappingURL=plans.controller.js.map