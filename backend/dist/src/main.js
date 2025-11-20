"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FastX Courier API')
        .setDescription('Production-ready courier service backend for Bangladesh')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User management')
        .addTag('Shipments', 'Shipment management and tracking')
        .addTag('Pickups', 'Pickup requests and management')
        .addTag('Hub', 'Hub operations and manifest management')
        .addTag('Rider', 'Rider delivery operations')
        .addTag('Tracking', 'Real-time shipment tracking')
        .addTag('Payments', 'Payment and wallet management')
        .addTag('Notifications', 'Notification management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 30001;
    await app.listen(port);
    console.log(`
    🚀 FastX Courier Backend is running!
    
    🌐 Application: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/docs
    🔧 Environment: ${process.env.NODE_ENV || 'development'}
    
    ✅ Database: Connected
    ✅ Auth: JWT + OTP
    ✅ Swagger: Enabled
  `);
}
bootstrap().catch((err) => {
    console.error('❌ Application failed to start:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map