import { TransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    amount: string;
    currency?: string;
    type: TransactionType;
    description?: string;
    reference?: string;
    metadata?: any;
    receiptUrl?: string;
    debitAccountId?: string;
    creditAccountId?: string;
    categoryId?: string;
}
