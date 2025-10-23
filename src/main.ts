// src/main.ts - Clean version with Health Controller
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ParsePrimitivesPipe } from './core/pipes/parse-boolean.pipe';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  try {
    console.log('🚀 Starting application bootstrap...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.set('trust proxy', true);
    app.use(cookieParser());

    // ✅ Handle OPTIONS requests in middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(200).send();
      }
      next();
    });

    // Global configurations
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ParsePrimitivesPipe(),
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // ✅ Simple CORS configuration
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://indiagalleri-frontend.vercel.app',
        'https://indigalleria-backend.onrender.com',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    
    console.log('🎉 ==========================================');
    console.log('✅ Application successfully started!');
    console.log(`📍 Running on port ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/`);
    console.log(`🔧 API base: http://localhost:${port}/api`);
    console.log('==========================================');

  } catch (error) {
    console.error('💥 Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();