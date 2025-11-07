// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
      ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationCache, payuConfig, paypalConfig, razorpayConfig],
    }),
    UnifiedCacheModule.registerAsync(),
    AuthModule,  
    AdminModule,
    ClientModule,
    SharedModule,
  ],
  controllers: [AppController], // ✅ Make sure AppController is here
  providers: [
    AppService, // ✅ Make sure AppService is here
    ConfigService,
  ],
})
export class AppModule {}