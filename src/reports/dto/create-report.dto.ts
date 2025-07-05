import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'Monthly Transaction Summary' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'transaction_summary',
    description:
      'Report type: transaction_summary, account_balance, monthly_analysis',
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    example: {
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
      accountId: 'uuid',
    },
  })
  @IsOptional()
  @IsObject()
  filters?: any;
}
