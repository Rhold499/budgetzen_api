import { CategoryType } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    type: CategoryType;
    isActive?: boolean;
}
