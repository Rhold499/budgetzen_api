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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("./webhooks.service");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let WebhooksController = class WebhooksController {
    webhooksService;
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async createSubscription(createSubscriptionDto, tenant) {
        return this.webhooksService.createSubscription(tenant.id, createSubscriptionDto.url, createSubscriptionDto.events, createSubscriptionDto.secret);
    }
    getAvailableEvents() {
        return {
            events: [
                'transaction.created',
                'transaction.validated',
                'transaction.rejected',
                'account.balance_changed',
                'user.created',
                'user.updated',
                'report.generated',
                'plan.upgraded',
            ],
        };
    }
    async testWebhook(testDto, tenant) {
        const testEvent = {
            id: require('crypto').randomUUID(),
            type: 'webhook.test',
            data: { message: 'This is a test webhook' },
            tenantId: tenant.id,
            timestamp: new Date(),
        };
        const subscription = {
            id: 'test',
            tenantId: tenant.id,
            url: testDto.url,
            events: ['webhook.test'],
            secret: testDto.secret || 'test-secret',
            isActive: true,
        };
        await this.webhooksService['sendWebhook'](subscription, testEvent);
        return { message: 'Test webhook sent successfully' };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('subscriptions'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create webhook subscription' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Webhook subscription created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available webhook events' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Available webhook events retrieved',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "getAvailableEvents", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test webhook delivery' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test webhook sent' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "testWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('webhooks'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map