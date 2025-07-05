import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Plans (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Register and login to get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'plans-test@example.com',
        password: 'password123',
        firstName: 'Plans',
        lastName: 'Test',
        role: 'ADMIN',
      });

    authToken = registerResponse.body.access_token;
    tenantId = registerResponse.body.user.tenantId;
  });

  afterAll(async () => {
    await prisma.cleanDb();
    await app.close();
  });

  describe('/plans/current/limits (GET)', () => {
    it('should get current plan limits', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/current/limits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('maxUsers');
          expect(res.body).toHaveProperty('maxAccounts');
          expect(res.body).toHaveProperty('features');
        });
    });
  });

  describe('/plans/check/:resource (GET)', () => {
    it('should check if can add users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/check/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('canAdd');
          expect(res.body).toHaveProperty('resource', 'users');
        });
    });

    it('should check if can add accounts', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/check/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('canAdd');
          expect(res.body).toHaveProperty('resource', 'accounts');
        });
    });
  });
});
