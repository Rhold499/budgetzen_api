import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    analyzeTransactions(dateFrom?: string, dateTo?: string, tenant?: any): Promise<import("./ai.types").TransactionAnalysis>;
    getMonthlyInsights(year?: number, tenant?: any): Promise<import("./ai.types").MonthlyInsight[]>;
    getRecommendations(tenant: any): Promise<{
        recommendations: string[];
    }>;
}
