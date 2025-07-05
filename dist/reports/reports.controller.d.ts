import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(createReportDto: CreateReportDto, tenant: any, user: any): Promise<({
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: import("@prisma/client/runtime/library").JsonValue | null;
        fileUrl: string | null;
    }) | {
        statusCode: any;
        message: any;
    }>;
    findAll(paginationDto: PaginationDto, tenant: any): Promise<{
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
            data: import("@prisma/client/runtime/library").JsonValue | null;
            tenantId: string;
            type: string;
            title: string;
            createdById: string;
            filters: import("@prisma/client/runtime/library").JsonValue | null;
            fileUrl: string | null;
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
    findOne(id: string, tenant: any): Promise<{
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
        data: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: import("@prisma/client/runtime/library").JsonValue | null;
        fileUrl: string | null;
    }>;
    remove(id: string, tenant: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        type: string;
        title: string;
        createdById: string;
        filters: import("@prisma/client/runtime/library").JsonValue | null;
        fileUrl: string | null;
    }>;
    exportReport(id: string, format: string, tenant: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
