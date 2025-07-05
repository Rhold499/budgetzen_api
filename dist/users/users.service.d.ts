import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { InviteUserDto } from './dto/invite-user.dto';
export declare class UsersService {
    private prisma;
    private plansService;
    private webhooksService;
    private jwtService;
    constructor(prisma: PrismaService, plansService: PlansService, webhooksService: WebhooksService, jwtService: JwtService);
    create(createUserDto: CreateUserDto, tenantId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
    }>;
    findAll(tenantId: string | undefined, page?: number, limit?: number, role?: string, search?: string, isActive?: string): Promise<{
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
    }>;
    findById(id: string, tenantId?: string, role?: string): Promise<{
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
    findByEmail(email: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, tenantId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string, tenantId: string): Promise<{
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
    inviteUserToTenant(dto: InviteUserDto, tenantId: string, inviterId: string): Promise<{
        link: string;
    }>;
    getUserTenants(userId: string): Promise<({
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
    switchTenant(userId: string, tenantId: string): Promise<{
        message: string;
        tenantId: string;
    }>;
    getUserLogs(userId: string, requesterRole?: string, requesterTenantId?: string): Promise<{
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
    }[]>;
}
