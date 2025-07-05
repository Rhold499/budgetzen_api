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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_service_1 = require("../supabase/supabase.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    supabase;
    configService;
    logger = new common_1.Logger(WebhooksService_1.name);
    maxRetries = 3;
    retryDelay = 1000;
    constructor(prisma, supabase, configService) {
        this.prisma = prisma;
        this.supabase = supabase;
        this.configService = configService;
    }
    async createSubscription(tenantId, url, events, secret) {
        const webhookSecret = secret || this.generateSecret();
        const subscription = await this.prisma.$executeRaw `
      INSERT INTO webhook_subscriptions (id, tenant_id, url, events, secret, is_active, created_at)
      VALUES (gen_random_uuid(), ${tenantId}, ${url}, ${JSON.stringify(events)}, ${webhookSecret}, true, now())
      RETURNING *
    `;
        return {
            id: subscription[0].id,
            tenantId,
            url,
            events,
            secret: webhookSecret,
            isActive: true,
        };
    }
    async triggerWebhook(event) {
        const subscriptions = await this.getActiveSubscriptions(event.tenantId, event.type);
        for (const subscription of subscriptions) {
            await this.sendWebhook(subscription, event);
        }
        await this.sendRealtimeNotification(event);
    }
    async sendWebhook(subscription, event, retryCount = 0) {
        try {
            const payload = {
                id: event.id,
                type: event.type,
                data: event.data,
                timestamp: event.timestamp.toISOString(),
            };
            const signature = this.generateSignature(JSON.stringify(payload), subscription.secret);
            const response = await fetch(subscription.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Event': event.type,
                    'User-Agent': 'FinancialSaaS-Webhooks/1.0',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.logger.log(`Webhook sent successfully to ${subscription.url} for event ${event.type}`);
            await this.logWebhookDelivery(subscription.id, event.id, 'success', null);
        }
        catch (error) {
            this.logger.error(`Webhook delivery failed: ${error.message}`);
            if (retryCount < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(2, retryCount);
                setTimeout(() => {
                    this.sendWebhook(subscription, event, retryCount + 1);
                }, delay);
            }
            else {
                await this.logWebhookDelivery(subscription.id, event.id, 'failed', error.message);
            }
        }
    }
    async sendRealtimeNotification(event) {
        try {
            const supabaseClient = this.supabase.getClient();
            await supabaseClient.channel(`tenant:${event.tenantId}`).send({
                type: 'broadcast',
                event: event.type,
                payload: {
                    id: event.id,
                    type: event.type,
                    data: event.data,
                    timestamp: event.timestamp,
                },
            });
            this.logger.log(`Real-time notification sent for event ${event.type}`);
        }
        catch (error) {
            this.logger.error(`Real-time notification failed: ${error.message}`);
        }
    }
    async getActiveSubscriptions(tenantId, eventType) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM webhook_subscriptions 
      WHERE tenant_id = ${tenantId}::uuid 
      AND is_active = true 
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(events) AS elem WHERE elem = ${eventType}
      )
    `;
        return Array.isArray(result)
            ? result.map((row) => ({
                id: row.id,
                tenantId: row.tenant_id,
                url: row.url,
                events: JSON.parse(row.events),
                secret: row.secret,
                isActive: row.is_active,
            }))
            : [];
    }
    generateSecret() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    generateSignature(payload, secret) {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }
    async logWebhookDelivery(subscriptionId, eventId, status, error) {
        await this.prisma.$executeRaw `
      INSERT INTO webhook_deliveries (id, subscription_id, event_id, status, error_message, created_at)
      VALUES (gen_random_uuid(), ${subscriptionId}, ${eventId}, ${status}, ${error}, now())
    `;
    }
    async onTransactionCreated(transaction) {
        const event = {
            id: require('crypto').randomUUID(),
            type: 'transaction.created',
            data: transaction,
            tenantId: transaction.tenantId,
            timestamp: new Date(),
        };
        await this.triggerWebhook(event);
    }
    async onTransactionValidated(transaction) {
        const event = {
            id: require('crypto').randomUUID(),
            type: 'transaction.validated',
            data: transaction,
            tenantId: transaction.tenantId,
            timestamp: new Date(),
        };
        await this.triggerWebhook(event);
    }
    async onAccountBalanceChanged(account, oldBalance, newBalance) {
        const event = {
            id: require('crypto').randomUUID(),
            type: 'account.balance_changed',
            data: {
                account,
                oldBalance,
                newBalance,
                change: (parseFloat(newBalance) - parseFloat(oldBalance)).toFixed(2),
            },
            tenantId: account.tenantId,
            timestamp: new Date(),
        };
        await this.triggerWebhook(event);
    }
    async onUserCreated(user) {
        const event = {
            id: require('crypto').randomUUID(),
            type: 'user.created',
            data: user,
            tenantId: user.tenantId,
            timestamp: new Date(),
        };
        await this.triggerWebhook(event);
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map