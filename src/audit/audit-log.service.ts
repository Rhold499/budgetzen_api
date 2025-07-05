import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, details: any = {}) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType: details.entityType || null,
        entityId: details.entityId || null,
        oldValues: details.oldValues || null,
        newValues: details.newValues || null,
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null,
      },
    });
  }
}
