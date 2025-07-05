import {
  IsString,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: '100.50',
    description:
      'Montant de la transaction, au format string décimal (ex: "100.50"). Utilisez une string pour éviter les imprécisions de flottants.',
  })
  @IsString()
  @IsDecimal({ decimal_digits: '0,2' })
  amount: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ example: 'Payment for services' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    example: { category: 'business', tags: ['consulting'] },
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ example: 'https://example.com/receipt.pdf' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({
    example: 'uuid-debit-account-id',
    description: 'UUID v4 du compte débité.',
  })
  @IsOptional()
  @IsUUID()
  debitAccountId?: string;

  @ApiPropertyOptional({
    example: 'uuid-credit-account-id',
    description: 'UUID v4 du compte crédité.',
  })
  @IsOptional()
  @IsUUID()
  creditAccountId?: string;

  @ApiPropertyOptional({
    example: 'uuid-category-id',
    description: 'UUID v4 de la catégorie.',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
