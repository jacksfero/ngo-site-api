import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
// backend/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

 // const port = process.env.PORT ?? 3000;
 // await app.listen(port);
  await app.listen(process.env.PORT ?? 3000);
 // console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
