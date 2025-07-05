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

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';
import { UserRole } from '@prisma/client';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @RequireFeature('budget_management')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget successfully created' })
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.budgetsService.create(
        createBudgetDto,
        tenant.id,
        user.id,
      );
    } catch (error) {
      console.error('Erreur dans /budgets (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully' })
  async findAll(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('categoryId') categoryId?: string,
    @CurrentTenant() tenant?: any,
    @CurrentUser() user?: any,
  ) {
    try {
      // Pour SUPERADMIN, ignorer tenantId pour tout voir
      if (user?.role === 'SUPERADMIN') {
        return await this.budgetsService.findAll(
          undefined,
          month,
          year,
          categoryId,
          user.role, // <-- pass userRole
        );
      }
      return await this.budgetsService.findAll(
        tenant.id,
        month,
        year,
        categoryId,
        user?.role, // <-- pass userRole
      );
    } catch (error) {
      console.error('Erreur dans /budgets (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('summary')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get budget summary' })
  @ApiResponse({
    status: 200,
    description: 'Budget summary retrieved successfully',
  })
  getSummary(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @CurrentTenant() tenant?: any,
  ) {
    return this.budgetsService.getBudgetSummary(
      tenant.id,
      month ? parseInt(month.toString()) : undefined,
      year ? parseInt(year.toString()) : undefined,
    );
  }

  @Get(':id')
  @RequireFeature('budget_management')
  @ApiOperation({ summary: 'Get budget by ID' })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.budgetsService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @RequireFeature('budget_management')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Update budget' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, tenant.id);
  }

  @Delete(':id')
  @RequireFeature('budget_management')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete budget' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.budgetsService.remove(id, tenant.id);
  }
}
