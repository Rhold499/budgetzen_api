import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@prisma/client';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, tenant: any, user: any): Promise<({
        _count: {
            transactions: number;
            budgets: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.CategoryType;
        description: string | null;
        color: string | null;
        icon: string | null;
        isDefault: boolean;
        createdById: string;
    }) | {
        statusCode: any;
        message: any;
    }>;
    findAll(type?: CategoryType, isActive?: boolean, tenant?: any, user?: any): Promise<({
        _count: {
            transactions: number;
            budgets: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.CategoryType;
        description: string | null;
        color: string | null;
        icon: string | null;
        isDefault: boolean;
        createdById: string;
    })[] | {
        statusCode: any;
        message: any;
    }>;
    getStats(categoryId?: string, tenant?: any): Promise<{
        totalTransactions: number;
        totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        monthlyStats: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TransactionGroupByOutputType, "categoryId"[]> & {
            _count: {
                categoryId: number;
            };
            _sum: {
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        })[];
    }>;
    findOne(id: string, tenant: any): Promise<{
        _count: {
            transactions: number;
            budgets: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.CategoryType;
        description: string | null;
        color: string | null;
        icon: string | null;
        isDefault: boolean;
        createdById: string;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, tenant: any): Promise<{
        _count: {
            transactions: number;
            budgets: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.CategoryType;
        description: string | null;
        color: string | null;
        icon: string | null;
        isDefault: boolean;
        createdById: string;
    }>;
    remove(id: string, tenant: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.CategoryType;
        description: string | null;
        color: string | null;
        icon: string | null;
        isDefault: boolean;
        createdById: string;
    }>;
}
