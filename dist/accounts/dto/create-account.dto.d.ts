import { AccountType } from '@prisma/client';
export declare class CreateAccountDto {
    name: string;
    type?: AccountType;
    balance?: string;
    currency?: string;
    isActive?: boolean;
    description?: string;
}
