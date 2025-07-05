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
exports.BudgetAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const budget_analytics_service_1 = require("./budget-analytics.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const plan_feature_guard_1 = require("../common/guards/plan-feature.guard");
let BudgetAnalyticsController = class BudgetAnalyticsController {
    budgetAnalyticsService;
    constructor(budgetAnalyticsService) {
        this.budgetAnalyticsService = budgetAnalyticsService;
    }
    getDashboard(tenant) {
        return this.budgetAnalyticsService.getDashboardSummary(tenant.id);
    }
    getExpensesByCategory(month, year, tenant) {
        return this.budgetAnalyticsService.getExpensesByCategory(tenant.id, month ? parseInt(month.toString()) : undefined, year ? parseInt(year.toString()) : undefined);
    }
    getMonthlyEvolution(year, categoryId, tenant) {
        return this.budgetAnalyticsService.getMonthlyEvolution(tenant.id, year ? parseInt(year.toString()) : undefined, categoryId);
    }
    getBudgetVsActual(month, year, tenant) {
        return this.budgetAnalyticsService.getBudgetVsActual(tenant.id, month ? parseInt(month.toString()) : undefined, year ? parseInt(year.toString()) : undefined);
    }
    getGoalProgress(tenant) {
        return this.budgetAnalyticsService.getGoalProgress(tenant.id);
    }
};
exports.BudgetAnalyticsController = BudgetAnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget dashboard summary' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Budget dashboard data retrieved successfully',
    }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetAnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('expenses-by-category'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expenses by category' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Expenses by category retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], BudgetAnalyticsController.prototype, "getExpensesByCategory", null);
__decorate([
    (0, common_1.Get)('monthly-evolution'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly evolution chart data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monthly evolution data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], BudgetAnalyticsController.prototype, "getMonthlyEvolution", null);
__decorate([
    (0, common_1.Get)('budget-vs-actual'),
    (0, plan_feature_guard_1.RequireFeature)('budget_management'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget vs actual spending comparison' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Budget vs actual data retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], BudgetAnalyticsController.prototype, "getBudgetVsActual", null);
__decorate([
    (0, common_1.Get)('goal-progress'),
    (0, plan_feature_guard_1.RequireFeature)('project_goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get goal progress data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Goal progress data retrieved successfully',
    }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetAnalyticsController.prototype, "getGoalProgress", null);
exports.BudgetAnalyticsController = BudgetAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('budget-analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('budget-analytics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, plan_feature_guard_1.PlanFeatureGuard),
    __metadata("design:paramtypes", [budget_analytics_service_1.BudgetAnalyticsService])
], BudgetAnalyticsController);
//# sourceMappingURL=budget-analytics.controller.js.map