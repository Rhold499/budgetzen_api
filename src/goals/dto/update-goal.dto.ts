import { PartialType } from '@nestjs/swagger';
import { CreateGoalDto } from './create-goal.dto';
import { IsDecimal, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {}

export class UpdateContributionDto {
  @ApiPropertyOptional({ example: '100.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  amount?: string;

  @ApiPropertyOptional({ example: 'Contribution mensuelle' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-transaction-id' })
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}
