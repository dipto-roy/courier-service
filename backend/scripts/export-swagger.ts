import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';

async function exportSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

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

  const outPath = join(process.cwd(), 'swagger.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));
  console.log(`swagger.json written to ${outPath}`);

  await app.close();
}

exportSwagger().catch((err) => {
  console.error('Failed to export swagger:', err);
  process.exit(1);
});
