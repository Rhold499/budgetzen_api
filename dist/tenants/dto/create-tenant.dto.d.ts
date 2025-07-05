import { PlanType } from '@prisma/client';
export declare class CreateTenantDto {
    name: string;
    subdomain?: string;
    planType?: PlanType;
    isActive?: boolean;
    settings?: any;
}
