import { Module, Logger, OnModuleInit } from '@nestjs/common';
 

import { AppController } from './app.controller';
import { AppService } from './app.service';
 
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
  
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesSeed } from './shared/database/seeds/roles.seed';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
 
import { PublicGuard } from './core/guards/public.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'; 
//import { MailModule } from './shared/mail/mail.module';
 
import { SharedModule } from './shared/shared.module';
import { UnifiedCacheModule } from './core/cache/cache.module';
 import { configurationCache } from './shared/config/configuration.cache';
import payuConfig from './shared/config/payu.config';
import paypalConfig from './shared/config/paypal.config';
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
       load: [configurationCache,payuConfig,paypalConfig],
      // validate: (config) => {
      //   if (!config.JWT_SECRET) {
      //     throw new Error('JWT_SECRET is required');
      //   }
      //   return config;
      // },
   //   envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    UnifiedCacheModule.registerAsync(), // ✅ global cache
    AuthModule,  
    AdminModule,
    ClientModule,
    SharedModule,
     
  //  MailModule,
  ],



  
  controllers: [AppController],
  providers: [
 /*
     {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Now applies globally BUT respects @Public()
    },
   //  RolesSeed,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    },*/
    ConfigService,
    AppService,
  ],
})
export class AppModule {}
  
  /*
export class AppModule   {
   

  constructor(private configService: ConfigService) {
  
 console.log('Database User--------:', this.configService.get<string>('DB_USERNAME'));
    }
  
}*/
/*

export class AppModule implements OnModuleInit {
   private readonly logger = new Logger(AppModule.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
      console.log('Database User--------:', this.configService.get<string>('DB_USERNAME'));
    this.logEnvironmentVariables();
  }
  

  private logEnvironmentVariables() {
    this.logger.log('=================================');
    this.logger.log('Database Host:', this.configService.get<string>('DB_HOST'));
    this.logger.log('Database User:', this.configService.get<string>('DB_USERNAME'));
    this.logger.log('Database Port:', this.configService.get<number>('DB_PORT'));
    this.logger.log('=================================');
  }
}*/
