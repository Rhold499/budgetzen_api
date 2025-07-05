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
exports.MobileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mobile_service_1 = require("./mobile.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let MobileController = class MobileController {
    mobileService;
    constructor(mobileService) {
        this.mobileService = mobileService;
    }
    async getDashboard(tenant, user) {
        return this.mobileService.getMobileDashboard(tenant.id, user.id);
    }
    async getAccounts(tenant, user) {
        return this.mobileService.getMobileAccounts(tenant.id, user.id);
    }
    async getTransactions(page = 1, limit = 20, accountId, tenant) {
        return this.mobileService.getMobileTransactions(tenant.id, page, limit, accountId);
    }
    async createQuickTransaction(createTransactionDto, tenant, user) {
        if (!['DEBIT', 'CREDIT'].includes(createTransactionDto.type)) {
            throw new common_1.BadRequestException('Invalid transaction type');
        }
        return this.mobileService.createQuickTransaction(tenant.id, user.id, createTransactionDto);
    }
    async getAccountBalance(accountId, tenant) {
        return this.mobileService.getAccountBalance(tenant.id, accountId);
    }
    async searchTransactions(query, limit = 10, tenant) {
        return this.mobileService.searchTransactions(tenant.id, query, limit);
    }
};
exports.MobileController = MobileController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mobile dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mobile dashboard', type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mobile-optimized accounts list' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mobile accounts retrieved successfully',
    }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mobile-optimized transactions list' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mobile transactions',
        type: Object,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('accountId')),
    __param(3, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('transactions/quick'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a quick transaction for mobile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "createQuickTransaction", null);
__decorate([
    (0, common_1.Get)('accounts/:id/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account balance for mobile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account balance retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('search/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Search transactions for mobile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search transactions',
        type: Object,
    }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "searchTransactions", null);
exports.MobileController = MobileController = __decorate([
    (0, swagger_1.ApiTags)('mobile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('mobile'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mobile_service_1.MobileService])
], MobileController);
//# sourceMappingURL=mobile.controller.js.map