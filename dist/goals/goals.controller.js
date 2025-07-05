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
exports.GoalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const goals_service_1 = require("./goals.service");
const create_goal_dto_1 = require("./dto/create-goal.dto");
const update_goal_dto_1 = require("./dto/update-goal.dto");
const create_contribution_dto_1 = require("./dto/create-contribution.dto");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const plan_feature_guard_1 = require("../common/guards/plan-feature.guard");
const client_1 = require("@prisma/client");
let GoalsController = class GoalsController {
    goalsService;
    constructor(goalsService) {
        this.goalsService = goalsService;
    }
    create(createGoalDto, tenant, user) {
        return this.goalsService.create(createGoalDto, tenant.id, user.id);
    }
    findAll(status, priority, tenant) {
        return this.goalsService.findAll(tenant.id, status, priority ? parseInt(priority.toString()) : undefined);
    }
    getStats(tenant) {
        return this.goalsService.getGoalStats(tenant.id);
    }
    findOne(id, tenant) {
        return this.goalsService.findOne(id, tenant.id);
    }
    getContributions(id, tenant) {
        return this.goalsService.getContributions(id, tenant.id);
    }
    addContribution(id, createContributionDto, tenant) {
        return this.goalsService.addContribution(id, createContributionDto, tenant.id);
    }
    linkTransaction(goalId, transactionId, tenant) {
        return this.goalsService.linkTransactionToGoal(transactionId, goalId, tenant.id);
    }
    update(id, updateGoalDto, tenant) {
        return this.goalsService.update(id, updateGoalDto, tenant.id);
    }
    remove(id, tenant) {
        return this.goalsService.remove(id, tenant.id);
    }
};
exports.GoalsController = GoalsController;
__decorate([
    (0, common_1.Post)(),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new goal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Goal successfully created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_goal_dto_1.CreateGoalDto, Object, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all goals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goals retrieved successfully' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goals statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goals statistics retrieved successfully',
    }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goal by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/contributions'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goal contributions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goal contributions retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "getContributions", null);
__decorate([
    (0, common_1.Post)(':id/contributions'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Add contribution to goal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contribution added successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_contribution_dto_1.CreateContributionDto, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "addContribution", null);
__decorate([
    (0, common_1.Post)(':goalId/link-transaction/:transactionId'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Link transaction to goal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transaction linked to goal successfully',
    }),
    __param(0, (0, common_1.Param)('goalId')),
    __param(1, (0, common_1.Param)('transactionId')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "linkTransaction", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Update goal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_goal_dto_1.UpdateGoalDto, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete goal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Goal deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Goal not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "remove", null);
exports.GoalsController = GoalsController = __decorate([
    (0, swagger_1.ApiTags)('goals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('goals'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, plan_feature_guard_1.PlanFeatureGuard),
    __metadata("design:paramtypes", [goals_service_1.GoalsService])
], GoalsController);
//# sourceMappingURL=goals.controller.js.map