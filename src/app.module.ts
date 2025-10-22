// app.module.ts
import { Module, Logger } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';  // Move filter to separate file

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { SharedModule } from './shared/shared.module';
import { UnifiedCacheModule } from './core/cache/cache.module';
import { configurationCache } from './shared/config/configuration.cache';
import payuConfig from './shared/config/payu.config';
import paypalConfig from './shared/config/paypal.config';
import razorpayConfig from './shared/config/razor.config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationCache, payuConfig, paypalConfig, razorpayConfig],
      // envFilePath: ['.env', '.env.development', '.env.production'], // Uncomment if needed
    }),
    UnifiedCacheModule.registerAsync(),
    AuthModule,  
    AdminModule,
    ClientModule,
    SharedModule,
  ],
  controllers: [AppController,HealthController],
  providers: [
    AppService,
    ConfigService,
    // ✅ Register global exception filter properly
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}