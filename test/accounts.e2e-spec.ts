import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Accounts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Register and login to get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'accounts-test@example.com',
        password: 'password123',
        firstName: 'Accounts',
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

  it('should forbid access to accounts without auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/accounts').expect(401);
  });

  it('should create an account with correct role', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Account',
        type: 'CHECKING',
        balance: 1000,
        currency: 'EUR',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('should not allow USER role to create an account', async () => {
    // Register a USER
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user4@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test',
        role: 'USER',
      });
    const userToken = userRes.body.access_token;
    const res = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'User Account',
        type: 'CHECKING',
        balance: 1000,
        currency: 'EUR',
      });
    expect(res.status).toBe(403);
  });

  it('should validate DTO and reject invalid account creation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
