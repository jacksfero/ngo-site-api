import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser'; // Import as a namespace
import { ParsePrimitivesPipe  } from './core/pipes/parse-boolean.pipe';
// backend/src/main.ts

async function bootstrap() {
 // const app = await NestFactory.create(AppModule);
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.set('trust proxy', true);
  app.use(cookieParser()); // Apply the middleware
  //app.useStaticAssets(join(__dirname, '..', 'uploads'));
   
 
   
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api'); // 👈 adds /api before all routes)

  
  app.useGlobalPipes(
   new ParsePrimitivesPipe(), 
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: false }, // Prevents auto-casting
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );


   app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://indiagalleri-frontend.vercel.app',
    ], // ✅ allow local React frontend
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Optional: allow cookies/auth headers if needed
     allowedHeaders: 'Content-Type, Authorization',
  });

   const port = process.env.PORT ?? 3000;
   await app.listen(port);
 // await app.listen(process.env.PORT ?? 3000);
   console.log(`🚀 Application is running on: http://localhost:${port}/api`);
   console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
