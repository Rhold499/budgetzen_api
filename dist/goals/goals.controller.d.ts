import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GoalStatus } from '@prisma/client';
export declare class GoalsController {
    private readonly goalsService;
    constructor(goalsService: GoalsService);
    create(createGoalDto: CreateGoalDto, tenant: any, user: any): Promise<{
        _count: {
            contributions: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        isPublic: boolean;
        createdById: string;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        currentAmount: import("@prisma/client/runtime/library").Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    findAll(status?: GoalStatus, priority?: number, tenant?: any): Promise<{
        progress: number;
        isCompleted: boolean;
        remaining: number;
        daysRemaining: any;
        _count: {
            contributions: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        isPublic: boolean;
        createdById: string;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        currentAmount: import("@prisma/client/runtime/library").Decimal;
        targetDate: Date | null;
        priority: number;
    }[]>;
    getStats(tenant: any): Promise<{
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalTargetAmount: number | import("@prisma/client/runtime/library").Decimal;
        totalCurrentAmount: number | import("@prisma/client/runtime/library").Decimal;
        overallProgress: number;
    }>;
    findOne(id: string, tenant: any): Promise<{
        progress: number;
        isCompleted: boolean;
        remaining: number;
        daysRemaining: any;
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
        contributions: ({
            transaction: {
                id: string;
                createdAt: Date;
                description: string;
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            goalId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        isPublic: boolean;
        createdById: string;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        currentAmount: import("@prisma/client/runtime/library").Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    getContributions(id: string, tenant: any): Promise<({
        transaction: {
            id: string;
            createdAt: Date;
            description: string;
            createdBy: {
                firstName: string;
                lastName: string;
            };
            amount: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        goalId: string;
    })[]>;
    addContribution(id: string, createContributionDto: CreateContributionDto, tenant: any): Promise<{
        contribution: {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            goalId: string;
        };
        goal: {
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.GoalStatus;
            description: string | null;
            title: string;
            isPublic: boolean;
            createdById: string;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            targetAmount: import("@prisma/client/runtime/library").Decimal;
            currentAmount: import("@prisma/client/runtime/library").Decimal;
            targetDate: Date | null;
            priority: number;
        };
        isCompleted: boolean;
    }>;
    linkTransaction(goalId: string, transactionId: string, tenant: any): Promise<{
        contribution: {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            goalId: string;
        };
        goal: {
            createdBy: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.GoalStatus;
            description: string | null;
            title: string;
            isPublic: boolean;
            createdById: string;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            targetAmount: import("@prisma/client/runtime/library").Decimal;
            currentAmount: import("@prisma/client/runtime/library").Decimal;
            targetDate: Date | null;
            priority: number;
        };
        isCompleted: boolean;
    }>;
    update(id: string, updateGoalDto: UpdateGoalDto, tenant: any): Promise<{
        _count: {
            contributions: number;
        };
        createdBy: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        isPublic: boolean;
        createdById: string;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        currentAmount: import("@prisma/client/runtime/library").Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    remove(id: string, tenant: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        isPublic: boolean;
        createdById: string;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        currentAmount: import("@prisma/client/runtime/library").Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
}
