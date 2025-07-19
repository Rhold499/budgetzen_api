import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://phi-admin-panel-ruddy.vercel.app/', 'https://ton-projet.up.railway.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global prefix
  const apiPrefix: string = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('financial API')
    .setDescription('Multi-tenant financial transaction management platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurity('x-tenant-id', {
      type: 'apiKey',
      in: 'header',
      name: 'x-tenant-id',
      description: 'Tenant ID (UUID)',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('tenants', 'Tenant management')
    .addTag('accounts', 'Account management')
    .addTag('transactions', 'Transaction management')
    .addTag('reports', 'Report generation')
    .addTag('admin', 'Admin endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT || configService.get('PORT', '3000'); // ✅ Important pour Railway
  await app.listen(port, '0.0.0.0'); // ✅ Important pour Railway

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

void bootstrap();
