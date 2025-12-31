import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable cookie parser for CSRF
  app.use(cookieParser());

  // Enable CORS with comprehensive settings
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow wildcard in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
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
