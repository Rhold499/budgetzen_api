import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BudgetAnalyticsService } from './budget-analytics.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';

@ApiTags('budget-analytics')
@ApiBearerAuth()
@Controller('budget-analytics')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class BudgetAnalyticsController {
  constructor(
    private readonly budgetAnalyticsService: BudgetAnalyticsService,
  ) {}

  @Get('dashboard')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get budget dashboard summary' })
  @ApiResponse({
    status: 200,
    description: 'Budget dashboard data retrieved successfully',
  })
  getDashboard(@CurrentTenant() tenant: any) {
    return this.budgetAnalyticsService.getDashboardSummary(tenant.id);
  }

  @Get('expenses-by-category')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get expenses by category' })
  @ApiResponse({
    status: 200,
    description: 'Expenses by category retrieved successfully',
  })
  getExpensesByCategory(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @CurrentTenant() tenant?: any,
  ) {
    return this.budgetAnalyticsService.getExpensesByCategory(
      tenant.id,
      month ? parseInt(month.toString()) : undefined,
      year ? parseInt(year.toString()) : undefined,
    );
  }

  @Get('monthly-evolution')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get monthly evolution chart data' })
  @ApiResponse({
    status: 200,
    description: 'Monthly evolution data retrieved successfully',
  })
  getMonthlyEvolution(
    @Query('year') year?: number,
    @Query('categoryId') categoryId?: string,
    @CurrentTenant() tenant?: any,
  ) {
    return this.budgetAnalyticsService.getMonthlyEvolution(
      tenant.id,
      year ? parseInt(year.toString()) : undefined,
      categoryId,
    );
  }

  @Get('budget-vs-actual')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get budget vs actual spending comparison' })
  @ApiResponse({
    status: 200,
    description: 'Budget vs actual data retrieved successfully',
  })
  getBudgetVsActual(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @CurrentTenant() tenant?: any,
  ) {
    return this.budgetAnalyticsService.getBudgetVsActual(
      tenant.id,
      month ? parseInt(month.toString()) : undefined,
      year ? parseInt(year.toString()) : undefined,
    );
  }

  @Get('goal-progress')
  @RequireFeature('project_goals')
  @ApiOperation({ summary: 'Get goal progress data' })
  @ApiResponse({
    status: 200,
    description: 'Goal progress data retrieved successfully',
  })
  getGoalProgress(@CurrentTenant() tenant: any) {
    return this.budgetAnalyticsService.getGoalProgress(tenant.id);
  }
}
