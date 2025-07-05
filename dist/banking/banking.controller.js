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
exports.BankingController = exports.BankTransactionDto = exports.ConnectBankDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const banking_service_1 = require("./banking.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const plan_feature_guard_1 = require("../common/guards/plan-feature.guard");
const client_1 = require("@prisma/client");
class ConnectBankDto {
    bankName;
    connectionType;
    credentials;
}
exports.ConnectBankDto = ConnectBankDto;
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 'BNP Paribas',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConnectBankDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: 'open_banking',
        enum: ['open_banking', 'scraping', 'manual'],
    }),
    (0, class_validator_1.IsEnum)(['open_banking', 'scraping', 'manual']),
    __metadata("design:type", String)
], ConnectBankDto.prototype, "connectionType", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        example: { clientId: 'abc', clientSecret: 'xyz' },
        type: 'object',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ConnectBankDto.prototype, "credentials", void 0);
class BankTransactionDto {
    amount;
    description;
}
exports.BankTransactionDto = BankTransactionDto;
__decorate([
    (0, swagger_2.ApiProperty)({ example: '100.50' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    __metadata("design:type", String)
], BankTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Payment for invoice #123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BankTransactionDto.prototype, "description", void 0);
let BankingController = class BankingController {
    bankingService;
    constructor(bankingService) {
        this.bankingService = bankingService;
    }
    async connectBank(connectBankDto, tenant) {
        return this.bankingService.connectBank(tenant.id, connectBankDto.bankName, connectBankDto.connectionType, connectBankDto.credentials);
    }
    async getBankConnections(tenant) {
        return this.bankingService.getBankConnections(tenant.id);
    }
    async syncBankTransactions(connectionId, tenant) {
        return this.bankingService.syncBankTransactions(connectionId, tenant.id);
    }
    async getBankAccounts(connectionId, tenant) {
        return this.bankingService.getBankAccounts(connectionId, tenant.id);
    }
    async disconnectBank(connectionId, tenant) {
        await this.bankingService.disconnectBank(connectionId, tenant.id);
        return { message: 'Bank connection removed successfully' };
    }
    getSupportedBanks() {
        return {
            banks: [
                {
                    name: 'BNP Paribas',
                    country: 'FR',
                    connectionTypes: ['open_banking', 'scraping'],
                    logo: 'https://example.com/logos/bnp.png',
                },
                {
                    name: 'Crédit Agricole',
                    country: 'FR',
                    connectionTypes: ['open_banking', 'scraping'],
                    logo: 'https://example.com/logos/ca.png',
                },
                {
                    name: 'Société Générale',
                    country: 'FR',
                    connectionTypes: ['open_banking'],
                    logo: 'https://example.com/logos/sg.png',
                },
                {
                    name: 'LCL',
                    country: 'FR',
                    connectionTypes: ['scraping'],
                    logo: 'https://example.com/logos/lcl.png',
                },
            ],
        };
    }
};
exports.BankingController = BankingController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, plan_feature_guard_1.RequireFeature)('bank_integration'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to bank account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bank connection established successfully',
        type: Object,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ConnectBankDto, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "connectBank", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, plan_feature_guard_1.RequireFeature)('bank_integration'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get bank connections' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bank connections retrieved successfully',
        type: Object,
    }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getBankConnections", null);
__decorate([
    (0, common_1.Post)('connections/:id/sync'),
    (0, plan_feature_guard_1.RequireFeature)('bank_integration'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Sync bank transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bank transactions synced successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "syncBankTransactions", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    (0, plan_feature_guard_1.RequireFeature)('bank_integration'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get bank accounts for a connection' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of bank accounts',
        type: Object,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getBankAccounts", null);
__decorate([
    (0, common_1.Delete)('connections/:id'),
    (0, plan_feature_guard_1.RequireFeature)('bank_integration'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect bank account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bank connection removed successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "disconnectBank", null);
__decorate([
    (0, common_1.Get)('supported-banks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of supported banks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supported banks list retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getSupportedBanks", null);
exports.BankingController = BankingController = __decorate([
    (0, swagger_1.ApiTags)('banking'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('banking'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, plan_feature_guard_1.PlanFeatureGuard),
    __metadata("design:paramtypes", [banking_service_1.BankingService])
], BankingController);
//# sourceMappingURL=banking.controller.js.map