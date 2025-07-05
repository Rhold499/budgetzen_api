import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;

    // List all Prisma model names explicitly
    const modelNames = [
      'auditLog',
      'user',
      'account',
      'transaction',
      'tenant',
      'category',
      'budget',
      'goal',
      // Ajoutez ici tous les modèles Prisma pertinents
    ];

    for (const modelName of modelNames) {
      // @ts-ignore
      if (typeof this[modelName]?.deleteMany === 'function') {
        // @ts-ignore
        await this[modelName].deleteMany();
      }
    }
  }
}
