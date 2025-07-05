import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { WebhooksService } from './webhooks.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@UseGuards(RolesGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create webhook subscription' })
  @ApiResponse({
    status: 201,
    description: 'Webhook subscription created successfully',
  })
  async createSubscription(
    @Body()
    createSubscriptionDto: {
      url: string;
      events: string[];
      secret?: string;
    },
    @CurrentTenant() tenant: any,
  ) {
    return this.webhooksService.createSubscription(
      tenant.id,
      createSubscriptionDto.url,
      createSubscriptionDto.events,
      createSubscriptionDto.secret,
    );
  }

  @Get('events')
  @ApiOperation({ summary: 'Get available webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Available webhook events retrieved',
  })
  getAvailableEvents() {
    return {
      events: [
        'transaction.created',
        'transaction.validated',
        'transaction.rejected',
        'account.balance_changed',
        'user.created',
        'user.updated',
        'report.generated',
        'plan.upgraded',
      ],
    };
  }

  @Post('test')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Test webhook delivery' })
  @ApiResponse({ status: 200, description: 'Test webhook sent' })
  async testWebhook(
    @Body() testDto: { url: string; secret?: string },
    @CurrentTenant() tenant: any,
  ) {
    const testEvent = {
      id: require('crypto').randomUUID(),
      type: 'webhook.test',
      data: { message: 'This is a test webhook' },
      tenantId: tenant.id,
      timestamp: new Date(),
    };

    // Create temporary subscription for test
    const subscription = {
      id: 'test',
      tenantId: tenant.id,
      url: testDto.url,
      events: ['webhook.test'],
      secret: testDto.secret || 'test-secret',
      isActive: true,
    };

    await this.webhooksService['sendWebhook'](subscription, testEvent);

    return { message: 'Test webhook sent successfully' };
  }
}
