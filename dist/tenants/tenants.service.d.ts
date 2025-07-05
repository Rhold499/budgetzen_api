import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: string;
        name: string;
        subdomain: string | null;
        planType: import(".prisma/client").$Enums.PlanType;
        isActive: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                users: number;
                accounts: number;
                transactions: number;
            };
        } & {
            id: string;
            name: string;
            subdomain: string | null;
            planType: import(".prisma/client").$Enums.PlanType;
            isActive: boolean;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userRole?: string, userTenantId?: string): Promise<{
        _count: {
            users: number;
            accounts: number;
            transactions: number;
        };
    } & {
        id: string;
        name: string;
        subdomain: string | null;
        planType: import(".prisma/client").$Enums.PlanType;
        isActive: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateTenantDto: UpdateTenantDto, userRole?: string, userTenantId?: string): Promise<{
        id: string;
        name: string;
        subdomain: string | null;
        planType: import(".prisma/client").$Enums.PlanType;
        isActive: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        subdomain: string | null;
        planType: import(".prisma/client").$Enums.PlanType;
        isActive: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(tenantId: string): Promise<{
        users: number;
        accounts: number;
        transactions: number;
        totalBalance: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
