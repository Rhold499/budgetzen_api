"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://ton-domaine.com', 'https://ton-projet.up.railway.app']
            : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    });
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    const port = process.env.PORT || configService.get('PORT', '3000');
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map