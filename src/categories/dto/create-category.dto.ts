import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentation' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Courses, restaurants, nourriture' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ example: '🍽️' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
