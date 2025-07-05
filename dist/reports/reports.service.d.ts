import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Prisma } from '@prisma/client';
import { PlansService } from '../plans/plans.service';
export declare class ReportsService {
    private prisma;
    private plansService;
    constructor(prisma: PrismaService, plansService: PlansService);
    create(createReportDto: CreateReportDto, tenantId: string, createdById: string): Promise<{
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: Prisma.JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: Prisma.JsonValue | null;
        fileUrl: string | null;
    }>;
    findAll(tenantId: string, page?: number, limit?: number): Promise<{
        data: ({
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: Prisma.JsonValue | null;
            tenantId: string;
            type: string;
            title: string;
            createdById: string;
            filters: Prisma.JsonValue | null;
            fileUrl: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: Prisma.JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: Prisma.JsonValue | null;
        fileUrl: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: Prisma.JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: Prisma.JsonValue | null;
        fileUrl: string | null;
    }>;
    private generateReportData;
    private generateTransactionSummary;
    private generateAccountBalanceReport;
    private generateMonthlyAnalysis;
}
