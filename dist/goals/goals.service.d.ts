import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GoalStatus, Prisma } from '@prisma/client';
export declare class GoalsService {
    private prisma;
    private plansService;
    constructor(prisma: PrismaService, plansService: PlansService);
    create(createGoalDto: CreateGoalDto, tenantId: string, createdById: string): Promise<{
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
        metadata: Prisma.JsonValue | null;
        targetAmount: Prisma.Decimal;
        currentAmount: Prisma.Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    findAll(tenantId: string, status?: GoalStatus, priority?: number): Promise<{
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
        metadata: Prisma.JsonValue | null;
        targetAmount: Prisma.Decimal;
        currentAmount: Prisma.Decimal;
        targetDate: Date | null;
        priority: number;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
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
                amount: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue | null;
        targetAmount: Prisma.Decimal;
        currentAmount: Prisma.Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    update(id: string, updateGoalDto: UpdateGoalDto, tenantId: string): Promise<{
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
        metadata: Prisma.JsonValue | null;
        targetAmount: Prisma.Decimal;
        currentAmount: Prisma.Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    remove(id: string, tenantId: string): Promise<{
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
        metadata: Prisma.JsonValue | null;
        targetAmount: Prisma.Decimal;
        currentAmount: Prisma.Decimal;
        targetDate: Date | null;
        priority: number;
    }>;
    addContribution(goalId: string, createContributionDto: CreateContributionDto, tenantId: string): Promise<{
        contribution: {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue | null;
            targetAmount: Prisma.Decimal;
            currentAmount: Prisma.Decimal;
            targetDate: Date | null;
            priority: number;
        };
        isCompleted: boolean;
    }>;
    getContributions(goalId: string, tenantId: string): Promise<({
        transaction: {
            id: string;
            createdAt: Date;
            description: string;
            createdBy: {
                firstName: string;
                lastName: string;
            };
            amount: Prisma.Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        transactionId: string | null;
        amount: Prisma.Decimal;
        goalId: string;
    })[]>;
    getGoalStats(tenantId: string): Promise<{
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalTargetAmount: number | Prisma.Decimal;
        totalCurrentAmount: number | Prisma.Decimal;
        overallProgress: number;
    }>;
    linkTransactionToGoal(transactionId: string, goalId: string, tenantId: string): Promise<{
        contribution: {
            id: string;
            createdAt: Date;
            description: string | null;
            transactionId: string | null;
            amount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue | null;
            targetAmount: Prisma.Decimal;
            currentAmount: Prisma.Decimal;
            targetDate: Date | null;
            priority: number;
        };
        isCompleted: boolean;
    }>;
}
