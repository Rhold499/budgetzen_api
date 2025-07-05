import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';
export interface PlanLimits {
    maxUsers: number;
    maxAccounts: number;
    maxOrganizations: number;
    features: string[];
}
export declare class PlansService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly planLimits;
    checkPlanLimits(tenantId: string, resource: 'users' | 'accounts' | 'organizations'): Promise<boolean>;
    validatePlanFeature(tenantId: string, feature: string): Promise<boolean>;
    getPlanLimits(planType: PlanType): Promise<PlanLimits>;
    upgradePlan(tenantId: string, newPlan: PlanType, userId: string): Promise<void>;
    getAllPlans(): Promise<{
        limits: Record<string, number>;
        tenantsCount: number;
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PlanType;
    }[]>;
    private getCurrentResourceCount;
}
