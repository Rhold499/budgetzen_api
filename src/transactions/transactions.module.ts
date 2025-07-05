import { Module, forwardRef } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    WebhooksModule,
    forwardRef(() => BudgetsModule), // Use forwardRef to avoid circular dependency
    PlansModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
