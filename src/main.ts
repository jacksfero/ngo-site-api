import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// backend/src/main.ts

async function bootstrap() {
 // const app = await NestFactory.create(AppModule);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  // Apply PublicGuard globally
  // app.useGlobalGuards(new PublicGuard());
  //  app.useGlobalPipes(new ValidationPipe());
   
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api'); // 👈 adds /api before all routes)

  //   app.setGlobalPrefix('api'); // 👈 adds /api before all routes

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove non-whitelisted properties
      forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
    }),
    //  new ClassSerializerInterceptor(app.get(Reflector)),
  );
   app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://indiagalleri-frontend.vercel.app',
    ], // ✅ allow local React frontend
    credentials: true, // Optional: allow cookies/auth headers if needed
  });

   const port = process.env.PORT ?? 3000;
   await app.listen(port);
 // await app.listen(process.env.PORT ?? 3000);
   console.log(`🚀 Application is running on: http://localhost:${port}/api`);
   console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
