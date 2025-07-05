import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: string;
        name: string;
        subdomain: string | null;
        planType: import(".prisma/client").$Enums.PlanType;
        isActive: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        statusCode: any;
        message: any;
    }>;
    findAll(paginationDto: PaginationDto): Promise<{
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
    } | {
        statusCode: any;
        message: any;
    }>;
    getCurrentTenant(tenant: any): any;
    getCurrentTenantStats(tenant: any): Promise<{
        users: number;
        accounts: number;
        transactions: number;
        totalBalance: number | import("@prisma/client/runtime/library").Decimal;
    } | {
        statusCode: any;
        message: any;
    }>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, updateTenantDto: UpdateTenantDto, user: any): Promise<{
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
}
