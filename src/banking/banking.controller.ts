import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDecimal,
  IsNotEmpty,
  IsEnum,
  IsObject,
} from 'class-validator';

import { BankingService } from './banking.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PlanFeatureGuard,
  RequireFeature,
} from '../common/guards/plan-feature.guard';
import { UserRole } from '@prisma/client';

// DTOs must be declared before the controller class to avoid ReferenceError
export class ConnectBankDto {
  @ApiProperty({
    example: 'BNP Paribas',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    example: 'open_banking',
    enum: ['open_banking', 'scraping', 'manual'],
  })
  @IsEnum(['open_banking', 'scraping', 'manual'])
  connectionType: 'open_banking' | 'scraping' | 'manual';

  @ApiProperty({
    example: { clientId: 'abc', clientSecret: 'xyz' },
    type: 'object',
  })
  @IsObject()
  credentials: any;
}

export class BankTransactionDto {
  @ApiProperty({ example: '100.50' })
  @IsString()
  @IsDecimal({ decimal_digits: '0,2' })
  amount: string;

  @ApiProperty({ example: 'Payment for invoice #123' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

@ApiTags('banking')
@ApiBearerAuth()
@Controller('banking')
@UseGuards(RolesGuard, PlanFeatureGuard)
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Post('connect')
  @RequireFeature('bank_integration')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Connect to bank account' })
  @ApiResponse({
    status: 201,
    description: 'Bank connection established successfully',
    type: Object,
  })
  async connectBank(
    @Body() connectBankDto: ConnectBankDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.bankingService.connectBank(
      tenant.id,
      connectBankDto.bankName,
      connectBankDto.connectionType,
      connectBankDto.credentials,
    );
  }

  @Get('connections')
  @RequireFeature('bank_integration')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get bank connections' })
  @ApiResponse({
    status: 200,
    description: 'Bank connections retrieved successfully',
    type: Object,
  })
  async getBankConnections(@CurrentTenant() tenant: any) {
    return this.bankingService.getBankConnections(tenant.id);
  }

  @Post('connections/:id/sync')
  @RequireFeature('bank_integration')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Sync bank transactions' })
  @ApiResponse({
    status: 200,
    description: 'Bank transactions synced successfully',
  })
  async syncBankTransactions(@Param('id') connectionId: string, @CurrentTenant() tenant: any) {
    return this.bankingService.syncBankTransactions(connectionId, tenant.id);
  }

  @Get('accounts/:id')
  @RequireFeature('bank_integration')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get bank accounts for a connection' })
  @ApiResponse({
    status: 200,
    description: 'List of bank accounts',
    type: Object,
  })
  async getBankAccounts(@Param('id') connectionId: string, @CurrentTenant() tenant: any) {
    return this.bankingService.getBankAccounts(connectionId, tenant.id);
  }

  @Delete('connections/:id')
  @RequireFeature('bank_integration')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Disconnect bank account' })
  @ApiResponse({
    status: 200,
    description: 'Bank connection removed successfully',
  })
  async disconnectBank(@Param('id') connectionId: string, @CurrentTenant() tenant: any) {
    await this.bankingService.disconnectBank(connectionId, tenant.id);
    return { message: 'Bank connection removed successfully' };
  }

  @Get('supported-banks')
  @ApiOperation({ summary: 'Get list of supported banks' })
  @ApiResponse({ status: 200, description: 'Supported banks list retrieved' })
  getSupportedBanks() {
    return {
      banks: [
        {
          name: 'BNP Paribas',
          country: 'FR',
          connectionTypes: ['open_banking', 'scraping'],
          logo: 'https://example.com/logos/bnp.png',
        },
        {
          name: 'Crédit Agricole',
          country: 'FR',
          connectionTypes: ['open_banking', 'scraping'],
          logo: 'https://example.com/logos/ca.png',
        },
        {
          name: 'Société Générale',
          country: 'FR',
          connectionTypes: ['open_banking'],
          logo: 'https://example.com/logos/sg.png',
        },
        {
          name: 'LCL',
          country: 'FR',
          connectionTypes: ['scraping'],
          logo: 'https://example.com/logos/lcl.png',
        },
      ],
    };
  }
}
