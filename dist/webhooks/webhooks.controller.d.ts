import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    createSubscription(createSubscriptionDto: {
        url: string;
        events: string[];
        secret?: string;
    }, tenant: any): Promise<import("./webhooks.service").WebhookSubscription>;
    getAvailableEvents(): {
        events: string[];
    };
    testWebhook(testDto: {
        url: string;
        secret?: string;
    }, tenant: any): Promise<{
        message: string;
    }>;
}
