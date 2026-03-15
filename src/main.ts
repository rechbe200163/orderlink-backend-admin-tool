// main.ts (NestJS + Express + Scalar UI)
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global Pipes & Interceptors
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // OpenAPI-Dokument erzeugen (ohne Swagger-UI zu mounten)
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Roh-Spec unter /openapi.json ausliefern (Express-Route)
  const express = app.getHttpAdapter().getInstance();
  express.get('/openapi.json', (_req: Request, res: Response) =>
    res.json(document),
  );

  // Scalar-UI unter /docs einhängen (Express – kein withFastify nötig)
  app.use(
    '/docs',
    apiReference({
      url: '/openapi.json',
      theme: 'default', // 'default' | 'moon' | 'purple' | 'solarized' | 'alternate'
    }),
  );

  //log every request to the console
  app.use(morgan('dev'));

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3001,
    '0.0.0.0',
  );
}
bootstrap();
