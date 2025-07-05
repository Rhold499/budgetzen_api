import { Controller, Get, Query, UseGuards, Logger, Body, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';
// import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    try {
      return await this.adminService.getDashboardStats();
    } catch (error) {
      this.logger.error('Error in getDashboardStats', error.stack || error);
      throw error;
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
  })
  async getSystemHealth() {
    try {
      return await this.adminService.getSystemHealth();
    } catch (error) {
      this.logger.error('Error in getSystemHealth', error.stack || error);
      throw error;
    }
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
  ) {
    try {
      return await this.adminService.getAuditLogs(
        Number(page),
        Number(limit),
        search,
        action,
        entityType,
        userId,
      );
    } catch (error) {
      this.logger.error('Error in getAuditLogs', error.stack || error);
      throw error;
    }
  }

  // @Get('analytics/tenants')
  // @ApiOperation({ summary: 'Get tenant analytics' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Tenant analytics retrieved successfully',
  // })
  // async getTenantAnalytics() {
  //   try {
  //     return await this.adminService.getTenantAnalytics();
  //   } catch (error) {
  //     this.logger.error('Error in getTenantAnalytics', error.stack || error);
  //     throw error;
  //   }
  // }

  @Get('kpis')
  @ApiOperation({ summary: 'Get global KPIs for superadmin dashboard' })
  @ApiResponse({ status: 200, description: 'KPIs globaux retournés' })
  async getGlobalKpis() {
    try {
      return await this.adminService.getGlobalKpis();
    } catch (error) {
      this.logger.error('Error in getGlobalKpis', error.stack || error);
      throw error;
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get global analytics for superadmin dashboard' })
  @ApiResponse({ status: 200, description: 'Analytics globaux retournés' })
  async getGlobalAnalytics() {
    try {
      return await this.adminService.getGlobalAnalytics();
    } catch (error) {
      this.logger.error('Error in getGlobalAnalytics', error.stack || error);
      throw error;
    }
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get global platform settings' })
  @ApiResponse({ status: 200, description: 'Global settings retrieved' })
  async getGlobalSettings() {
    try {
      return await this.adminService.getGlobalSettings();
    } catch (error) {
      this.logger.error('Error in getGlobalSettings', error.stack || error);
      throw error;
    }
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update global platform settings' })
  @ApiResponse({ status: 200, description: 'Global settings updated' })
  async updateGlobalSettings(@Body() data: any) {
    try {
      return await this.adminService.updateGlobalSettings(data);
    } catch (error) {
      this.logger.error('Error in updateGlobalSettings', error.stack || error);
      throw error;
    }
  }
}
