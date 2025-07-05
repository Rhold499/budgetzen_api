import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PlansService, PlanLimits } from './plans.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole, PlanType } from '@prisma/client';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('plans')
@ApiBearerAuth()
@Controller('plans')
@UseGuards(RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('current/limits')
  @ApiOperation({ summary: 'Get current plan limits' })
  @ApiResponse({ status: 200, description: 'Plan limits', type: Object })
  async getCurrentPlanLimits(
    @CurrentTenant() tenant: any,
  ): Promise<PlanLimits> {
    return this.plansService.getPlanLimits(tenant.planType);
  }

  @Get('check/:resource')
  @ApiOperation({ summary: 'Check if resource limit is reached' })
  @ApiResponse({ status: 200, description: 'Resource limit check completed' })
  async checkResourceLimit(
    @Param('resource') resource: 'users' | 'accounts' | 'organizations',
    @CurrentTenant() tenant: any,
  ) {
    const canAdd = await this.plansService.checkPlanLimits(tenant.id, resource);
    return { canAdd, resource };
  }

  @Post('upgrade')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Upgrade plan' })
  @ApiResponse({ status: 200, description: 'Plan upgraded successfully' })
  async upgradePlan(
    @Body('planType') planType: PlanType,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    // TODO: Vérification du paiement ici (à implémenter plus tard)
    // if (!await this.plansService.isPaymentValid(user.id, planType)) {
    //   throw new ForbiddenException('Paiement non validé');
    // }
    await this.plansService.upgradePlan(tenant.id, planType, user.id);
    return { message: 'Plan upgraded successfully', newPlan: planType };
  }

  @Get()
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiResponse({ status: 200, description: 'List of all plans' })
  async getAllPlans() {
    return this.plansService.getAllPlans();
  }
}
