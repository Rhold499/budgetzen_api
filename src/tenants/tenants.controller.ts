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

import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant successfully created' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    try {
      return await this.tenantsService.create(createTenantDto);
    } catch (error) {
      console.error('Erreur dans /tenants (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      return await this.tenantsService.findAll(
        paginationDto.page,
        paginationDto.limit,
      );
    } catch (error) {
      console.error('Erreur dans /tenants (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant information' })
  @ApiResponse({
    status: 200,
    description: 'Current tenant retrieved successfully',
  })
  getCurrentTenant(@CurrentTenant() tenant: any) {
    return tenant;
  }

  @Get('current/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get current tenant statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tenant statistics retrieved successfully',
  })
  async getCurrentTenantStats(@CurrentTenant() tenant: any) {
    try {
      if (!tenant || !tenant.id) {
        return {
          statusCode: 400,
          message:
            "Aucun tenant trouvé dans le contexte ou champ 'id' manquant. Vérifiez le header x-tenant-id et l'existence du tenant.",
        };
      }
      // Vérification du format UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(tenant.id)) {
        return {
          statusCode: 400,
          message:
            "Le champ 'id' du tenant n'est pas un UUID valide : " + tenant.id,
        };
      }
      const stats = await this.tenantsService.getStats(tenant.id);
      if (!stats) {
        return {
          statusCode: 404,
          message: 'Aucune statistique trouvée pour ce tenant.',
        };
      }
      return stats;
    } catch (error) {
      console.error('Erreur dans /tenants/current/stats:', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tenantsService.findOne(id, user.role, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.update(
      id,
      updateTenantDto,
      user.role,
      user.tenantId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
