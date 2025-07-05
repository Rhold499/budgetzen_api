import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Response } from 'express';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';
import { UserRole } from '@prisma/client';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @RequireFeature('pdf_reports')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 201, description: 'Report successfully generated' })
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.reportsService.create(
        createReportDto,
        tenant.id,
        user.id,
      );
    } catch (error) {
      console.error('Erreur dans /reports (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentTenant() tenant: any,
  ) {
    try {
      return await this.reportsService.findAll(
        tenant.id,
        paginationDto.page,
        paginationDto.limit,
      );
    } catch (error) {
      console.error('Erreur dans /reports (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.reportsService.findOne(id, tenant.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.reportsService.remove(id, tenant.id);
  }

  @Get(':id/export')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Exporter un rapport (PDF ou Excel)' })
  @ApiResponse({ status: 200, description: 'Fichier exporté' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportReport(
    @Param('id') id: string,
    @Query('format') format: string = 'pdf',
    @CurrentTenant() tenant: any,
    @Res() res: Response,
  ) {
    // Validation du format
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ message: 'Format must be pdf or excel' });
    }
    // Génération du fichier (mock, à remplacer par vraie génération)
    const report = await this.reportsService.findOne(id, tenant.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    // Simule un buffer de fichier
    const fileBuffer = Buffer.from(
      `Export du rapport: ${report.title} (${format})`,
    );
    const fileName = `${report.title.replace(/\s+/g, '_')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader(
      'Content-Type',
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    return res.send(fileBuffer);
  }
}
