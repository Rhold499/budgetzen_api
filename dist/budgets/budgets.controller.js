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
exports.BudgetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const budgets_service_1 = require("./budgets.service");
const create_budget_dto_1 = require("./dto/create-budget.dto");
const update_budget_dto_1 = require("./dto/update-budget.dto");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const plan_feature_guard_1 = require("../common/guards/plan-feature.guard");
const client_1 = require("@prisma/client");
let BudgetsController = class BudgetsController {
    budgetsService;
    constructor(budgetsService) {
        this.budgetsService = budgetsService;
    }
    async create(createBudgetDto, tenant, user) {
        try {
            return await this.budgetsService.create(createBudgetDto, tenant.id, user.id);
        }
        catch (error) {
            console.error('Erreur dans /budgets (POST):', error);
            return {
                statusCode: error.status || 500,
                message: error.message || 'Internal server error',
            };
        }
    }
    async findAll(month, year, categoryId, tenant, user) {
        try {
            if (user?.role === 'SUPERADMIN') {
                return await this.budgetsService.findAll(undefined, month, year, categoryId, user.role);
            }
            return await this.budgetsService.findAll(tenant.id, month, year, categoryId, user?.role);
        }
        catch (error) {
            console.error('Erreur dans /budgets (GET):', error);
            return {
                statusCode: error.status || 500,
                message: error.message || 'Internal server error',
            };
        }
    }
    getSummary(month, year, tenant) {
        return this.budgetsService.getBudgetSummary(tenant.id, month ? parseInt(month.toString()) : undefined, year ? parseInt(year.toString()) : undefined);
    }
    findOne(id, tenant) {
        return this.budgetsService.findOne(id, tenant.id);
    }
    update(id, updateBudgetDto, tenant) {
        return this.budgetsService.update(id, updateBudgetDto, tenant.id);
    }
    remove(id, tenant) {
        return this.budgetsService.remove(id, tenant.id);
    }
};
exports.BudgetsController = BudgetsController;
__decorate([
    (0, common_1.Post)(),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new budget' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Budget successfully created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_budget_dto_1.CreateBudgetDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all budgets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Budgets retrieved successfully' }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, tenant_decorator_1.CurrentTenant)()),
    __param(4, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object, Object]),
    __metadata("design:returntype", Promise)
], BudgetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget summary' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Budget summary retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], BudgetsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Budget retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Budget not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BudgetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.USER, client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.MEMBER),
    (0, swagger_1.ApiOperation)({ summary: 'Update budget' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Budget updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Budget not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_budget_dto_1.UpdateBudgetDto, Object]),
    __metadata("design:returntype", void 0)
], BudgetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete budget' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Budget deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Budget not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BudgetsController.prototype, "remove", null);
exports.BudgetsController = BudgetsController = __decorate([
    (0, swagger_1.ApiTags)('budgets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('budgets'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, plan_feature_guard_1.PlanFeatureGuard),
    __metadata("design:paramtypes", [budgets_service_1.BudgetsService])
], BudgetsController);
//# sourceMappingURL=budgets.controller.js.map