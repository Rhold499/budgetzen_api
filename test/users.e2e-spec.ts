import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const API_PREFIX = '/api/v1';

describe('Users (e2e) - SUPERADMIN & ADMIN', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superadminToken: string;
  let adminToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Register SUPERADMIN
    const superadminRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/register`)
      .send({
        email: 'superadmin-test@example.com',
        password: 'password123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPERADMIN',
      });
    superadminToken = superadminRes.body.access_token;

    // Register ADMIN
    const adminRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/register`)
      .send({
        email: 'admin-test@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.access_token;
    if (!adminRes.body.user || !adminRes.body.user.tenantId) {
      throw new Error(
        'La réponse de création ADMIN ne contient pas user.tenantId : ' +
          JSON.stringify(adminRes.body),
      );
    }
    tenantId = adminRes.body.user.tenantId;
  });

  afterAll(async () => {
    await prisma.cleanDb();
    await app.close();
  });

  it('SUPERADMIN peut lister tous les utilisateurs (sans tenant)', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API_PREFIX}/users`)
      .set('Authorization', `Bearer ${superadminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('SUPERADMIN peut filtrer par tenantId', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API_PREFIX}/users?tenantId=${tenantId}`)
      .set('Authorization', `Bearer ${superadminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Tous les users retournés doivent avoir le bon tenantId
    for (const user of res.body.data) {
      expect(user.tenantId).toBe(tenantId);
    }
  });

  it('ADMIN ne peut voir que les users de son tenant', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API_PREFIX}/users`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    for (const user of res.body.data) {
      expect(user.tenantId).toBe(tenantId);
    }
  });
});
