// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ParsePrimitivesPipe } from './core/pipes/parse-boolean.pipe';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);
  app.use(cookieParser());

  // Global filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  // Global prefix - ALL routes will be under /api
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ParsePrimitivesPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS setup
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://indiagalleri-frontend.vercel.app',
      'https://indigalleria-backend.onrender.com', // Add your own domain
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  
  // ✅ Better startup logging
  console.log('🎉 ==========================================');
  console.log('🚀 Indiagalleria Backend API Started!');
  console.log(`📍 Local: http://localhost:${port}/api`);
  console.log(`🌐 Render: https://indigalleria-backend.onrender.com/api`);
  console.log('✅ Health Check: https://indigalleria-backend.onrender.com/api/');
  console.log('==========================================');
}

bootstrap();