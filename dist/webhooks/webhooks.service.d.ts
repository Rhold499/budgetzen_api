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
export declare class WebhooksService {
    private prisma;
    private supabase;
    private configService;
    private readonly logger;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(prisma: PrismaService, supabase: SupabaseService, configService: ConfigService);
    createSubscription(tenantId: string, url: string, events: string[], secret?: string): Promise<WebhookSubscription>;
    triggerWebhook(event: WebhookEvent): Promise<void>;
    private sendWebhook;
    private sendRealtimeNotification;
    private getActiveSubscriptions;
    private generateSecret;
    private generateSignature;
    private logWebhookDelivery;
    onTransactionCreated(transaction: any): Promise<void>;
    onTransactionValidated(transaction: any): Promise<void>;
    onAccountBalanceChanged(account: any, oldBalance: string, newBalance: string): Promise<void>;
    onUserCreated(user: any): Promise<void>;
}
