// main.ts (NestJS + Fastify + Scalar UI)
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { contentParser } from 'fastify-multer';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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

  // Roh-Spec unter /openapi.json ausliefern (Fastify-Route)
  const fastify = app.getHttpAdapter().getInstance();
  fastify.get('/openapi.json', (_req: any, reply: any) => reply.send(document));

  // Scalar-UI (Elysia-Style) unter /docs einhängen
  app.use(
    '/docs',
    apiReference({
      url: '/openapi.json', // alternativ: content: document
      withFastify: true, // WICHTIG bei Fastify-Adapter
      theme: 'nestjs', // 'default' | 'moon' | 'purple' | 'solarized' | 'alternate'
    }),
  );

  // Upload & Static Assets (dein bestehendes Setup)
  app.register(contentParser);
  app.useStaticAssets({ root: join(__dirname, '../../fastify-file-upload') });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
