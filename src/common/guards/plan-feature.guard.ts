import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from '../../plans/plans.service';

export const REQUIRED_FEATURE_KEY = 'requiredFeature';
export const RequireFeature =
  (feature: string) =>
  (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(
      REQUIRED_FEATURE_KEY,
      feature,
      descriptor?.value || target,
    );
  };

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private plansService: PlansService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRED_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const hasFeature = await this.plansService.validatePlanFeature(
      tenant.id,
      requiredFeature,
    );

    if (!hasFeature) {
      throw new ForbiddenException(
        `Feature '${requiredFeature}' not available in your current plan`,
      );
    }

    return true;
  }
}
