import { GoalStatus } from '@prisma/client';
export declare class CreateGoalDto {
    title: string;
    description?: string;
    targetAmount: string;
    currency?: string;
    targetDate?: string;
    status?: GoalStatus;
    priority?: number;
    isPublic?: boolean;
    metadata?: any;
}
