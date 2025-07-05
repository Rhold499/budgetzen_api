import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// e2e tests for reports module (security, guards, export)
describe('Reports (e2e)', () => {
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
        email: 'reports-test@example.com',
        password: 'password123',
        firstName: 'Reports',
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

  it('should forbid access to reports without auth', async () => {
    await request(app.getHttpServer()).get('/api/v1/reports').expect(401);
  });

  it('should create a report with correct role and feature', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Report',
        type: 'transaction_summary',
        filters: {},
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('data');
  });

  it('should not allow USER role to create a report', async () => {
    // Register a USER
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user2@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test',
        role: 'USER',
      });
    const userToken = userRes.body.access_token;
    const res = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User Report',
        type: 'transaction_summary',
        filters: {},
      });
    expect(res.status).toBe(403);
  });

  it('should validate DTO and reject invalid report creation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('should export a report (simulate export endpoint)', async () => {
    // Simulate export endpoint (to be implemented)
    // For now, just check that report data is accessible
    const res = await request(app.getHttpServer())
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should export a report as PDF with correct role', async () => {
    // Crée un rapport
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Exportable Report',
        type: 'transaction_summary',
        filters: {},
      });
    const reportId = createRes.body.id;
    // Export PDF
    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/${reportId}/export?format=pdf`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/pdf');
    expect(res.header['content-disposition']).toContain('attachment');
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('should export a report as Excel with correct role', async () => {
    // Crée un rapport
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Exportable Excel',
        type: 'transaction_summary',
        filters: {},
      });
    const reportId = createRes.body.id;
    // Export Excel
    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/${reportId}/export?format=excel`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.header['content-disposition']).toContain('attachment');
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('should forbid USER role to export a report', async () => {
    // Register a USER
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'user-export@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Export',
        role: 'USER',
      });
    const userToken = userRes.body.access_token;
    // Crée un rapport avec ADMIN
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'User Export Blocked',
        type: 'transaction_summary',
        filters: {},
      });
    const reportId = createRes.body.id;
    // USER tente d'exporter
    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/${reportId}/export?format=pdf`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should return 400 for invalid export format', async () => {
    // Crée un rapport
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Invalid Format',
        type: 'transaction_summary',
        filters: {},
      });
    const reportId = createRes.body.id;
    // Tente d'exporter avec un format invalide
    const res = await request(app.getHttpServer())
      .get(`/api/v1/reports/${reportId}/export?format=txt`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(400);
  });
});
