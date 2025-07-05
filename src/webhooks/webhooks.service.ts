import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  tenantId: string;
  timestamp: Date;
  retryCount?: number;
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  async createSubscription(
    tenantId: string,
    url: string,
    events: string[],
    secret?: string,
  ): Promise<WebhookSubscription> {
    const webhookSecret = secret || this.generateSecret();

    // Store webhook subscription in database
    const subscription = await this.prisma.$executeRaw`
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

  async triggerWebhook(event: WebhookEvent): Promise<void> {
    const subscriptions = await this.getActiveSubscriptions(
      event.tenantId,
      event.type,
    );

    for (const subscription of subscriptions) {
      await this.sendWebhook(subscription, event);
    }

    // Also send real-time notification via Supabase
    await this.sendRealtimeNotification(event);
  }

  private async sendWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent,
    retryCount = 0,
  ): Promise<void> {
    try {
      const payload = {
        id: event.id,
        type: event.type,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
      };

      const signature = this.generateSignature(
        JSON.stringify(payload),
        subscription.secret,
      );

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

      this.logger.log(
        `Webhook sent successfully to ${subscription.url} for event ${event.type}`,
      );

      // Log successful delivery
      await this.logWebhookDelivery(subscription.id, event.id, 'success', null);
    } catch (error) {
      this.logger.error(`Webhook delivery failed: ${error.message}`);

      if (retryCount < this.maxRetries) {
        // Retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          this.sendWebhook(subscription, event, retryCount + 1);
        }, delay);
      } else {
        // Log failed delivery after max retries
        await this.logWebhookDelivery(
          subscription.id,
          event.id,
          'failed',
          error.message,
        );
      }
    }
  }

  private async sendRealtimeNotification(event: WebhookEvent): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Real-time notification failed: ${error.message}`);
    }
  }

  private async getActiveSubscriptions(
    tenantId: string,
    eventType: string,
  ): Promise<WebhookSubscription[]> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM webhook_subscriptions 
      WHERE tenant_id = ${tenantId}::uuid 
      AND is_active = true 
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(events) AS elem WHERE elem = ${eventType}
      )
    `;

    return Array.isArray(result)
      ? result.map((row: any) => ({
          id: row.id,
          tenantId: row.tenant_id,
          url: row.url,
          events: JSON.parse(row.events),
          secret: row.secret,
          isActive: row.is_active,
        }))
      : [];
  }

  private generateSecret(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private async logWebhookDelivery(
    subscriptionId: string,
    eventId: string,
    status: 'success' | 'failed',
    error?: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO webhook_deliveries (id, subscription_id, event_id, status, error_message, created_at)
      VALUES (gen_random_uuid(), ${subscriptionId}, ${eventId}, ${status}, ${error}, now())
    `;
  }

  // Event trigger methods
  async onTransactionCreated(transaction: any): Promise<void> {
    const event: WebhookEvent = {
      id: require('crypto').randomUUID(),
      type: 'transaction.created',
      data: transaction,
      tenantId: transaction.tenantId,
      timestamp: new Date(),
    };

    await this.triggerWebhook(event);
  }

  async onTransactionValidated(transaction: any): Promise<void> {
    const event: WebhookEvent = {
      id: require('crypto').randomUUID(),
      type: 'transaction.validated',
      data: transaction,
      tenantId: transaction.tenantId,
      timestamp: new Date(),
    };

    await this.triggerWebhook(event);
  }

  async onAccountBalanceChanged(
    account: any,
    oldBalance: string, // changed from number to string
    newBalance: string, // changed from number to string
  ): Promise<void> {
    const event: WebhookEvent = {
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

  async onUserCreated(user: any): Promise<void> {
    const event: WebhookEvent = {
      id: require('crypto').randomUUID(),
      type: 'user.created',
      data: user,
      tenantId: user.tenantId,
      timestamp: new Date(),
    };

    await this.triggerWebhook(event);
  }
}
