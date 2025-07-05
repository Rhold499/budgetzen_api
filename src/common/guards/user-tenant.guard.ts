import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserTenantGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenant = request.tenant;
    if (!user || !tenant) {
      throw new ForbiddenException('User or tenant context missing');
    }
    const link = await this.prisma.userTenant.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
    });
    if (!link || link.status !== 'active') {
      throw new ForbiddenException('User is not active in this tenant');
    }
    // Optionally, attach the user-tenant link to the request for later use
    request.userTenant = link;
    return true;
  }
}
