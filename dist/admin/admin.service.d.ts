import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totals: {
            tenants: number;
            users: number;
            accounts: number;
            transactions: number;
        };
        activeTenants: number;
        recentTransactions: ({
            tenant: {
                id: string;
                name: string;
            };
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            createdById: string;
            currency: string;
            creditAccountId: string | null;
            debitAccountId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            receiptUrl: string | null;
            network: string | null;
            categoryId: string | null;
        })[];
    }>;
    getSystemHealth(): Promise<{
        database: boolean;
        pendingTransactions: number;
        failedTransactions: number;
        inactiveUsers: number;
        timestamp: Date;
    }>;
    private checkDatabaseConnection;
    getAuditLogs(page?: number, limit?: number, search?: string, action?: string, entityType?: string, userId?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            transactionId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTenantAnalytics(): Promise<{
        byPlan: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TenantGroupByOutputType, "planType"[]> & {
            _count: {
                planType: number;
            };
        })[];
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TenantGroupByOutputType, "isActive"[]> & {
            _count: {
                isActive: number;
            };
        })[];
        monthlyGrowth: {
            month: string;
            count: number;
        }[];
    }>;
    private calculateMonthlyGrowth;
    getGlobalKpis(): Promise<{
        totalTenants: number;
        totalUsers: number;
        totalAdmins: number;
        totalTransactions: number;
        volumeTransactionsValidees: number | import("@prisma/client/runtime/library").Decimal;
        tenantsCeMois: number;
        usersCeMois: number;
        moyenneMembresParTenant: number;
        repartitionPlans: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TenantGroupByOutputType, "planType"[]> & {
            _count: {
                planType: number;
            };
        })[];
    }>;
    getGlobalAnalytics(): Promise<{
        monthlyGrowth: {
            month: string;
            tenants: number;
            users: number;
        }[];
        transactionsByMonth: {
            month: string;
            count: number;
            volume: number;
        }[];
        spendingByCategory: {
            category: string;
            amount: number;
        }[];
        goalsAchieved: {
            month: string;
            achieved: number;
        }[];
        topTenants: {
            name: string;
            users: number;
            transactions: number;
            plan: import(".prisma/client").$Enums.PlanType;
        }[];
    }>;
    getGlobalSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        features: import("@prisma/client/runtime/library").JsonValue;
        emailTemplates: import("@prisma/client/runtime/library").JsonValue;
        securityRules: import("@prisma/client/runtime/library").JsonValue;
        systemSettings: import("@prisma/client/runtime/library").JsonValue;
    } | {
        emailTemplates: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        securityRules: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        features: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
    }>;
    updateGlobalSettings(data: any): Promise<{
        emailTemplates: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        securityRules: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        features: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
    }>;
}
