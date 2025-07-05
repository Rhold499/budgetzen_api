import { PlansService, PlanLimits } from './plans.service';
import { PlanType } from '@prisma/client';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    getCurrentPlanLimits(tenant: any): Promise<PlanLimits>;
    checkResourceLimit(resource: 'users' | 'accounts' | 'organizations', tenant: any): Promise<{
        canAdd: boolean;
        resource: "users" | "accounts" | "organizations";
    }>;
    upgradePlan(planType: PlanType, tenant: any, user: any): Promise<{
        message: string;
        newPlan: import(".prisma/client").$Enums.PlanType;
    }>;
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
}
