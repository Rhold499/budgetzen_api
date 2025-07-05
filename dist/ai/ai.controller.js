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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const plan_feature_guard_1 = require("../common/guards/plan-feature.guard");
const client_1 = require("@prisma/client");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async analyzeTransactions(dateFrom, dateTo, tenant) {
        const from = dateFrom
            ? new Date(dateFrom)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = dateTo ? new Date(dateTo) : new Date();
        return this.aiService.analyzeTransactions(tenant.id, from, to);
    }
    async getMonthlyInsights(year, tenant) {
        const targetYear = year || new Date().getFullYear();
        return this.aiService.generateMonthlyInsights(tenant.id, targetYear);
    }
    async getRecommendations(tenant) {
        const recommendations = await this.aiService.generateSmartRecommendations(tenant.id);
        return { recommendations };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('analyze/transactions'),
    (0, plan_feature_guard_1.RequireFeature)('ai_analysis'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze transactions with AI insights' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction analysis',
        type: Object,
    }),
    __param(0, (0, common_1.Query)('dateFrom')),
    __param(1, (0, common_1.Query)('dateTo')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeTransactions", null);
__decorate([
    (0, common_1.Get)('insights/monthly'),
    (0, plan_feature_guard_1.RequireFeature)('ai_analysis'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly AI insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Monthly insights', type: Object }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getMonthlyInsights", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, plan_feature_guard_1.RequireFeature)('ai_analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get smart recommendations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Smart recommendations generated' }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getRecommendations", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, plan_feature_guard_1.PlanFeatureGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map