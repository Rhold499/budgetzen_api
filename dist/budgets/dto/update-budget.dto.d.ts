import { CreateBudgetDto } from './create-budget.dto';
declare const UpdateBudgetDto_base: import("@nestjs/common").Type<Partial<CreateBudgetDto>>;
export declare class UpdateBudgetDto extends UpdateBudgetDto_base {
    amount?: string;
    currency?: string;
    month?: number;
    year?: number;
    categoryId?: string;
    alertAt?: string;
}
export {};
