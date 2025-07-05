export interface TransactionAnalysis {
    summary: string;
    insights: string[];
    recommendations: string[];
    riskScore: number;
    categories: {
        [key: string]: number;
    };
}
export interface MonthlyInsight {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    topCategories: string[];
    unusualTransactions: any[];
}
