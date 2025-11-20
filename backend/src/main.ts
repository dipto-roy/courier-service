import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
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
