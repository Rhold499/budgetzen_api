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

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction successfully created' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.transactionsService.create(
        createTransactionDto,
        tenant.id,
        user.id,
      );
    } catch (error) {
      console.error('Erreur dans /transactions (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filtersDto: TransactionFiltersDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      // Pour SUPERADMIN, ignorer tenantId pour tout voir
      if (user.role === 'SUPERADMIN') {
        return await this.transactionsService.findAll(
          undefined,
          paginationDto.page,
          paginationDto.limit,
          filtersDto,
          user.role, // <-- pass userRole
        );
      }
      return await this.transactionsService.findAll(
        tenant.id,
        paginationDto.page,
        paginationDto.limit,
        filtersDto,
        user.role, // <-- pass userRole
      );
    } catch (error) {
      console.error('Erreur dans /transactions (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
  })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @CurrentTenant() tenant?: any,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    return this.transactionsService.getStats(tenant.id, from, to);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.transactionsService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.update(
      id,
      updateTransactionDto,
      tenant.id,
      user.id,
    );
  }

  @Post(':id/validate')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Validate transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction validated successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  validateTransaction(
    @Param('id') id: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.validateTransaction(id, tenant.id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Reject transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  rejectTransaction(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.rejectTransaction(
      id,
      tenant.id,
      user.id,
      reason,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.transactionsService.remove(id, tenant.id, user.id);
  }
}
