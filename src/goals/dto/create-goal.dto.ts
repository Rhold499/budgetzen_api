import {
  IsString,
  IsOptional,
  IsDecimal,
  IsDateString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({ example: 'Économiser pour un voyage' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: "Voyage en Europe prévu pour l'été prochain",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2000.00' })
  @IsDecimal({ decimal_digits: '0,2' })
  targetAmount: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({ enum: GoalStatus, default: GoalStatus.ACTIVE })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional({ example: 1, description: '1=High, 2=Medium, 3=Low' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: { category: 'travel', tags: ['vacation'] } })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
