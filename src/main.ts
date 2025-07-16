import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { CacheInvalidationInterceptor } from './cache/cache-invalidation.interceptor';
import { CacheInvalidationService } from './cache/cache-invalidation.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(
    new CacheInvalidationInterceptor(
      app.get(Reflector),
      app.get(CacheInvalidationService),
    ),
  );
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Optionally test Swagger UI
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
