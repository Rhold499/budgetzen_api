import { TransactionStatus, TransactionType } from '@prisma/client';
export declare class TransactionFiltersDto {
    status?: TransactionStatus;
    type?: TransactionType;
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
}
