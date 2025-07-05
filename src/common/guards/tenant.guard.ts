import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { validate as isUuid } from 'uuid';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let JWT guard handle this
    }

    // For superadmin, allow access to all tenants
    if (user.role === 'SUPERADMIN') {
      const tenantId = this.extractTenantId(request);
      if (tenantId && isUuid(tenantId)) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
        });
        if (tenant) {
          request.tenant = tenant;
        }
      }
      // Si pas d'UUID valide, on ignore la recherche tenant
      return true;
    }

    // For regular users, ensure they belong to the tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant || !tenant.isActive) {
      throw new ForbiddenException('Tenant not found or inactive');
    }

    request.tenant = tenant;
    return true;
  }

  private extractTenantId(request: any): string | null {
    // Try to get tenant ID from subdomain
    const host = request.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }

    // Try to get tenant ID from request params or headers
    return request.params?.tenantId || request.headers['x-tenant-id'] || null;
  }
}
