// src/main.ts - Clean version with Health Controller
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ParsePrimitivesPipe } from './core/pipes/parse-boolean.pipe';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

async function bootstrap() {
  try {
    console.log('🚀 Starting application bootstrap...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      // Add buffer logs to see what's happening during bootstrap
      bufferLogs: true,
    });

       // ✅ Trust proxy first
    app.set('trust proxy', true);
    // ✅ Cookie parser early
    app.use(cookieParser());
     // ✅ CORS configuration BEFORE any custom middleware
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://indiagalleri-frontend.vercel.app',
        'https://indigalleria-backend.onrender.com',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      preflightContinue: false, // Important: Let Nest handle OPTIONS
      optionsSuccessStatus: 204
    });

     // ✅ Remove custom OPTIONS handler - Let Nest CORS handle it
    // If you need custom OPTIONS handling, use this instead:
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Only handle OPTIONS if CORS didn't handle it
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

      // ✅ Global configurations in correct order
    app.setGlobalPrefix('api');

    // Global pipes
    app.useGlobalPipes(
      new ParsePrimitivesPipe(),
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        // Add validation error handling
        exceptionFactory: (errors) => {
          console.log('Validation errors:', errors);
          return errors;
        },
      }),
    );
   
       // Global filters
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Global interceptors
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
     
 // ✅ Add request logging middleware for debugging
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

    
const port = process.env.PORT || 3000;
    
    console.log('🔧 Starting server...');
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