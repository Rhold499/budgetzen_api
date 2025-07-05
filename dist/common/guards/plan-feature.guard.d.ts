import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from '../../plans/plans.service';
export declare const REQUIRED_FEATURE_KEY = "requiredFeature";
export declare const RequireFeature: (feature: string) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare class PlanFeatureGuard implements CanActivate {
    private reflector;
    private plansService;
    constructor(reflector: Reflector, plansService: PlansService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
