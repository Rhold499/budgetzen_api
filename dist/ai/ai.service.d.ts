import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TransactionAnalysis, MonthlyInsight } from './ai.types';
export declare class AiService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    analyzeTransactions(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<TransactionAnalysis>;
    generateMonthlyInsights(tenantId: string, year: number): Promise<MonthlyInsight[]>;
    generateSmartRecommendations(tenantId: string): Promise<string[]>;
    private calculateRiskScore;
    private generateRecommendations;
    private detectUnusualTransactions;
    private getTopCategories;
}
