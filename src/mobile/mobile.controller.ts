import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { MobileService } from './mobile.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { MobileAccount } from './mobile.types';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile')
@UseGuards(RolesGuard)
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get mobile dashboard data' })
  @ApiResponse({ status: 200, description: 'Mobile dashboard', type: Object })
  async getDashboard(@CurrentTenant() tenant: { id: string }, @CurrentUser() user: { id: string }) {
    return this.mobileService.getMobileDashboard(tenant.id, user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get mobile-optimized accounts list' })
  @ApiResponse({
    status: 200,
    description: 'Mobile accounts retrieved successfully',
  })
  async getAccounts(
    @CurrentTenant() tenant: { id: string },
    @CurrentUser() user: { id: string },
  ): Promise<MobileAccount[]> {
    return this.mobileService.getMobileAccounts(tenant.id, user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get mobile-optimized transactions list' })
  @ApiResponse({
    status: 200,
    description: 'Mobile transactions',
    type: Object,
  })
  async getTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('accountId') accountId?: string,
    @CurrentTenant() tenant?: any,
  ) {
    return this.mobileService.getMobileTransactions(
      tenant.id,
      page,
      limit,
      accountId,
    );
  }

  @Post('transactions/quick')
  @ApiOperation({ summary: 'Create a quick transaction for mobile' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createQuickTransaction(
    @Body() createTransactionDto: {
      amount: number;
      type: 'DEBIT' | 'CREDIT';
      description?: string;
      accountId: string;
      category?: string;
    },
    @CurrentTenant() tenant: { id: string },
    @CurrentUser() user: { id: string },
  ) {
    if (!['DEBIT', 'CREDIT'].includes(createTransactionDto.type)) {
      throw new BadRequestException('Invalid transaction type');
    }
    return this.mobileService.createQuickTransaction(
      tenant.id,
      user.id,
      createTransactionDto,
    );
  }

  @Get('accounts/:id/balance')
  @ApiOperation({ summary: 'Get account balance for mobile' })
  @ApiResponse({
    status: 200,
    description: 'Account balance retrieved successfully',
  })
  async getAccountBalance(
    @Param('id') accountId: string,
    @CurrentTenant() tenant: { id: string },
  ) {
    return this.mobileService.getAccountBalance(tenant.id, accountId);
  }

  @Get('search/transactions')
  @ApiOperation({ summary: 'Search transactions for mobile' })
  @ApiResponse({
    status: 200,
    description: 'Search transactions',
    type: Object,
  })
  async searchTransactions(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @CurrentTenant() tenant?: any,
  ) {
    return this.mobileService.searchTransactions(tenant.id, query, limit);
  }
}
