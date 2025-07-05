import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';
import { GoalStatus, UserRole } from '@prisma/client';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @RequireFeature('project_goals')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal successfully created' })
  create(
    @Body() createGoalDto: CreateGoalDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.goalsService.create(createGoalDto, tenant.id, user.id);
  }

  @Get()
  @RequireFeature('project_goals')
  @ApiOperation({ summary: 'Get all goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  findAll(
    @Query('status') status?: GoalStatus,
    @Query('priority') priority?: number,
    @CurrentTenant() tenant?: any,
  ) {
    return this.goalsService.findAll(
      tenant.id,
      status,
      priority ? parseInt(priority.toString()) : undefined,
    );
  }

  @Get('stats')
  @RequireFeature('project_goals')
  @ApiOperation({ summary: 'Get goals statistics' })
  @ApiResponse({
    status: 200,
    description: 'Goals statistics retrieved successfully',
  })
  getStats(@CurrentTenant() tenant: any) {
    return this.goalsService.getGoalStats(tenant.id);
  }

  @Get(':id')
  @RequireFeature('project_goals')
  @ApiOperation({ summary: 'Get goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.goalsService.findOne(id, tenant.id);
  }

  @Get(':id/contributions')
  @RequireFeature('project_goals')
  @ApiOperation({ summary: 'Get goal contributions' })
  @ApiResponse({
    status: 200,
    description: 'Goal contributions retrieved successfully',
  })
  getContributions(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.goalsService.getContributions(id, tenant.id);
  }

  @Post(':id/contributions')
  @RequireFeature('project_goals')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Add contribution to goal' })
  @ApiResponse({ status: 201, description: 'Contribution added successfully' })
  addContribution(
    @Param('id') id: string,
    @Body() createContributionDto: CreateContributionDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.goalsService.addContribution(
      id,
      createContributionDto,
      tenant.id,
    );
  }

  @Post(':goalId/link-transaction/:transactionId')
  @RequireFeature('project_goals')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Link transaction to goal' })
  @ApiResponse({
    status: 201,
    description: 'Transaction linked to goal successfully',
  })
  linkTransaction(
    @Param('goalId') goalId: string,
    @Param('transactionId') transactionId: string,
    @CurrentTenant() tenant: any,
  ) {
    return this.goalsService.linkTransactionToGoal(
      transactionId,
      goalId,
      tenant.id,
    );
  }

  @Patch(':id')
  @RequireFeature('project_goals')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Update goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.goalsService.update(id, updateGoalDto, tenant.id);
  }

  @Delete(':id')
  @RequireFeature('project_goals')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.goalsService.remove(id, tenant.id);
  }
}
