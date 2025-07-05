import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PlansModule } from '../plans/plans.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PlansModule, WebhooksModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
