import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma, CategoryType } from '@prisma/client';
import { PlansService } from '../plans/plans.service';
export declare class CategoriesService {
    private prisma;
    private plansService;
    constructor(prisma: PrismaService, plansService: PlansService);
    create(createCategoryDto: CreateCategoryDto, tenantId: string, createdById: string): Promise<{
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
    findAll(tenantId: string | undefined, type?: CategoryType, isActive?: boolean, userRole?: string): Promise<({
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
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
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
    update(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string): Promise<{
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
    remove(id: string, tenantId: string): Promise<{
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
    getStats(tenantId: string, categoryId?: string): Promise<{
        totalTransactions: number;
        totalAmount: number | Prisma.Decimal;
        monthlyStats: (Prisma.PickEnumerable<Prisma.TransactionGroupByOutputType, "categoryId"[]> & {
            _count: {
                categoryId: number;
            };
            _sum: {
                amount: Prisma.Decimal;
            };
        })[];
    }>;
}
