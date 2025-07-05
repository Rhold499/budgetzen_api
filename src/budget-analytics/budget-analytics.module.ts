import { Module } from '@nestjs/common';
import { BudgetAnalyticsService } from './budget-analytics.service';
import { BudgetAnalyticsController } from './budget-analytics.controller';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [BudgetAnalyticsController],
  providers: [BudgetAnalyticsService],
  exports: [BudgetAnalyticsService],
})
export class BudgetAnalyticsModule {}
