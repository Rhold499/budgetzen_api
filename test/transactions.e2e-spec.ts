import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let tenantId: string;
  let accountId: string;

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
        email: 'transactions-test@example.com',
        password: 'password123',
        firstName: 'Transactions',
        lastName: 'Test',
        role: 'ADMIN',
      });
    authToken = registerResponse.body.access_token;
    tenantId = registerResponse.body.user.tenantId;

    // Create an account
    const accountRes = await request(app.getHttpServer())
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Account',
        type: 'CHECKING',
        balance: 1000,
        currency: 'EUR',
      });
    accountId = accountRes.body.id;
  });

  afterAll(async () => {
    await prisma.cleanDb();
    await app.close();
  });

  it('should forbid access to transactions without auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/transactions').expect(401);
  });

  it('should create a transaction with correct role', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        type: 'DEBIT',
        debitAccountId: accountId,
        currency: 'EUR',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('amount');
  });

  it('should not allow USER role to create a transaction', async () => {
    // Register a USER
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user3@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test',
        role: 'USER',
      });
    const userToken = userRes.body.access_token;
    const res = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 100,
        type: 'DEBIT',
        debitAccountId: accountId,
        currency: 'EUR',
      });
    expect(res.status).toBe(403);
  });

  it('should validate DTO and reject invalid transaction creation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
