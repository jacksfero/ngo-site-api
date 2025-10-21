import { Module, Logger, OnModuleInit, Catch, ExceptionFilter,ArgumentsHost } from '@nestjs/common';
 

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
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
       load: [configurationCache,payuConfig,paypalConfig,razorpayConfig],
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
  @Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    console.error('🚨 Global Error:', {
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      error: exception,
      stack: exception instanceof Error ? exception.stack : 'No stack'
    });

    // Check for circular reference errors
    if (exception instanceof Error && 
        (exception.message.includes('circular') || 
         exception.stack?.includes('TransformOperationExecutor'))) {
      console.error('🔴 CIRCULAR REFERENCE DETECTED in:', request.url);
      console.error('Route:', request.route?.path);
    }

    // Your normal error handling...
  }
}
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
