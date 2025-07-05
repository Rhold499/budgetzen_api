import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, tenant: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
    } | {
        statusCode: any;
        message: any;
    }>;
    findAll(query: any, tenant: any, user: any): Promise<{
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            lastLoginAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        statusCode: number;
        message: any;
    }>;
    getProfile(user: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date;
        tenantId: string;
    }>;
    findOne(id: string, tenant: any, user: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date;
        tenantId: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, tenant: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string, tenant: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        password: string;
        tenantId: string | null;
    }>;
    invite(inviteUserDto: InviteUserDto, tenant: any, inviter: any): Promise<{
        link: string;
    }>;
    getMyTenants(user: any): Promise<({
        tenant: {
            id: string;
            name: string;
            subdomain: string | null;
            planType: import(".prisma/client").$Enums.PlanType;
            isActive: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        role: string;
        tenantId: string;
        status: string;
        joinedAt: Date;
        userId: string;
    })[]>;
    switchTenant(user: any, body: {
        tenantId: string;
    }): Promise<{
        message: string;
        tenantId: string;
    }>;
    getUserLogs(id: string, user: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            transactionId: string | null;
        }[];
    }>;
}
