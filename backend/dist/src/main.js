"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
            ];
            if (!origin)
                return callback(null, true);
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'x-csrf-token',
        ],
        exposedHeaders: ['Set-Cookie'],
        maxAge: 3600,
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