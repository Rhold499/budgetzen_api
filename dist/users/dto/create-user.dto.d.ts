import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    isActive?: boolean;
    tenantId?: string;
    password?: string;
}
