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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { InviteUserDto } from './dto/invite-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentTenant() tenant: any,
  ) {
    try {
      return await this.usersService.create(createUserDto, tenant.id);
    } catch (error) {
      console.error('Erreur dans /users (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Le contexte tenant doit être transmis via le header x-tenant-id (et non dans l’URL). Ne pas utiliser ?tenantId=... dans la query.',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query() query: any,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      const { page = 1, limit = 10, role, search, isActive } = query;
      // Si tenant est présent, on l'utilise (cas normal pour ADMIN ou SUPERADMIN avec tenant valide)
      if (tenant && tenant.id) {
        return this.usersService.findAll(
          tenant.id,
          Number(page),
          Number(limit),
          role,
          search,
          isActive,
        );
      }
      // Si SUPERADMIN et header x-tenant-id fourni mais tenant non trouvé
      if (user.role === 'SUPERADMIN' && query.tenantId) {
        return {
          statusCode: 404,
          message: 'Le tenant spécifié est introuvable ou inactif.',
        };
      }
      // Si SUPERADMIN sans tenant, retourne tous les users
      if (user.role === 'SUPERADMIN') {
        return this.usersService.findAll(
          undefined,
          Number(page),
          Number(limit),
          role,
          search,
          isActive,
        );
      }
      // Sinon, interdit
      return {
        statusCode: 403,
        message: 'Tenant context is required to list users.',
      };
    } catch (error) {
      console.error('Erreur dans /users:', error);
      return {
        statusCode: 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.usersService.findById(id, tenant?.id, user?.role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.usersService.update(id, updateUserDto, tenant.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.usersService.remove(id, tenant.id);
  }

  @Post('invite')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Invite a user to the tenant',
    description:
      'Invite an existing or new user to join the current tenant. Envoie un lien sécurisé par email.',
  })
  @ApiResponse({ status: 201, description: 'Invitation link generated' })
  async invite(
    @Body() inviteUserDto: InviteUserDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() inviter: any,
  ) {
    return this.usersService.inviteUserToTenant(
      inviteUserDto,
      tenant.id,
      inviter.id,
    );
  }

  @Get('/me/tenants')
  @ApiOperation({
    summary: 'List all tenants for the current user',
    description:
      'Retourne la liste des organisations auxquelles l’utilisateur appartient.',
  })
  @ApiResponse({ status: 200, description: 'List of tenants' })
  async getMyTenants(@CurrentUser() user: any) {
    return this.usersService.getUserTenants(user.id);
  }

  @Patch('/me/tenant')
  @ApiOperation({
    summary: 'Switch active tenant',
    description:
      'Change le tenant actif de l’utilisateur (pour le multi-tenant).',
  })
  @ApiResponse({ status: 200, description: 'Tenant switched' })
  async switchTenant(
    @CurrentUser() user: any,
    @Body() body: { tenantId: string },
  ) {
    return this.usersService.switchTenant(user.id, body.tenantId);
  }

  @Get(':id/logs')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get audit logs for a user' })
  @ApiResponse({ status: 200, description: 'User logs retrieved successfully' })
  async getUserLogs(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const logs = await this.usersService.getUserLogs(id, user.role, user.tenantId);
    return { data: logs };
  }
}
