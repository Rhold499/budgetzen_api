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

import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account successfully created' })
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.accountsService.create(
        createAccountDto,
        tenant.id,
        user.id,
      );
    } catch (error) {
      console.error('Erreur dans /accounts (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      const ownerId = user.role === 'USER' ? user.id : undefined;
      // Pour SUPERADMIN, ignorer tenantId et ownerId pour tout voir
      if (user.role === 'SUPERADMIN') {
        return await this.accountsService.findAll(
          undefined,
          paginationDto.page,
          paginationDto.limit,
          undefined,
          user.role, // <-- pass userRole
        );
      }
      return await this.accountsService.findAll(
        tenant.id,
        paginationDto.page,
        paginationDto.limit,
        ownerId,
        user.role, // <-- pass userRole
      );
    } catch (error) {
      console.error('Erreur dans /accounts (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.findOne(id, tenant.id, user.role, user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({
    status: 200,
    description: 'Account balance retrieved successfully',
  })
  getBalance(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.accountsService.getBalance(id, tenant.id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get account transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
  })
  getTransactionHistory(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.accountsService.getTransactionHistory(
      id,
      tenant.id,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.update(
      id,
      updateAccountDto,
      tenant.id,
      user.role,
      user.id,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.accountsService.remove(id, tenant.id, user.role, user.id);
  }
}
