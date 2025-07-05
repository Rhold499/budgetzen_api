import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AiService } from './ai.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';
import { UserRole } from '@prisma/client';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('analyze/transactions')
  @RequireFeature('ai_analysis')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Analyze transactions with AI insights' })
  @ApiResponse({
    status: 200,
    description: 'Transaction analysis',
    type: Object,
  })
  async analyzeTransactions(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @CurrentTenant() tenant?: any,
  ) {
    const from = dateFrom
      ? new Date(dateFrom)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo ? new Date(dateTo) : new Date();

    return this.aiService.analyzeTransactions(tenant.id, from, to);
  }

  @Get('insights/monthly')
  @RequireFeature('ai_analysis')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get monthly AI insights' })
  @ApiResponse({ status: 200, description: 'Monthly insights', type: Object })
  async getMonthlyInsights(
    @Query('year') year?: number,
    @CurrentTenant() tenant?: any,
  ) {
    const targetYear = year || new Date().getFullYear();
    return this.aiService.generateMonthlyInsights(tenant.id, targetYear);
  }

  @Get('recommendations')
  @RequireFeature('ai_analysis')
  @ApiOperation({ summary: 'Get smart recommendations' })
  @ApiResponse({ status: 200, description: 'Smart recommendations generated' })
  async getRecommendations(@CurrentTenant() tenant: any) {
    const recommendations = await this.aiService.generateSmartRecommendations(
      tenant.id,
    );
    return { recommendations };
  }
}
