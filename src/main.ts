// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ParsePrimitivesPipe } from './core/pipes/parse-boolean.pipe';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
//import { setGlobalEmitter } from './shared/events/emitters/global-emitter';

async function bootstrap() {
  try {
    console.log('🚀 Starting application bootstrap...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    //  const emitter = app.get(EventEmitter2);
    //  setGlobalEmitter(emitter);

    // ✅ Trust proxy
    app.set('trust proxy', true);

    // ✅ Cookie parser
    app.use(cookieParser());

     // ✅ Request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      console.log(`➡️ [${new Date().toISOString()}] ${req.method} ${req.url}`);
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`⬅️ [${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      });

      res.on('close', () => {
        const duration = Date.now() - start;
        console.log(`💥 [${new Date().toISOString()}] ${req.method} ${req.url} - Connection closed - ${duration}ms`);
      });

      next();
    });

    // ✅ CORS configuration
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://indiagalleri-frontend.vercel.app',
        'https://indigalleria-backend.onrender.com',
        'https://rare-quietude-production-ab48.up.railway.app',
        'https://www.indigalleria.com','https://indigalleria.com',
        'wwww.indigalleria.com','indigalleria.com',
        'https://indigalleria-frontend-production.up.railway.app',
        'https://indigalleria-frontend-production.up.railway.app/',
        'indigalleria-frontend-production.up.railway.app'
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // ✅ Optional fallback for OPTIONS
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'OPTIONS' && !res.headersSent) {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.status(204).send();
        return;
      }
      next();
    });

    // ✅ Global prefix
    app.setGlobalPrefix('api');

    // ✅ Global pipes
    app.useGlobalPipes(
      new ParsePrimitivesPipe(),
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // ✅ Global filters
    app.useGlobalFilters(new GlobalExceptionFilter());

    // ✅ Use only JwtAuthGuard globally
   // app.useGlobalGuards(app.get(JwtAuthGuard));

    // ✅ Global interceptors
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

   

    // ✅ Start server
    const port = process.env.PORT || 3030;
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
