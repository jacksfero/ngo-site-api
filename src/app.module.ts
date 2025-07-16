import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

//import { TypeOrmModule } from '@nestjs/typeorm';
import { SurfaceModule } from './modules/admin/surface/surface.module';
//import { Surface } from './admin/surface/entities/surface.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { SubjectModule } from './modules/admin/subject/subject.module';
import { CurrencyModule } from './modules/admin/currency/currency.module';
import { ShippingModule } from './modules/admin/shipping/shipping.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesSeed } from './shared/database/seeds/roles.seed';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { GlobalModule } from './global/global.module';
import { PublicGuard } from './core/guards/public.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    DatabaseModule,
    AuthModule,

    SurfaceModule,
    SubjectModule,
    CurrencyModule,
    ShippingModule,
    AdminModule,
    ClientModule,
    GlobalModule,
  ],

  controllers: [AppController],
  providers: [
    /*//  RolesSeed,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    },*/

    AppService,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    // Access and print the environment variables here
    console.log(
      '=================================' +
        __dirname +
        '/admin/subject/entities/*.entity{.ts,.js}',
    );

    console.log('Database Host:', this.configService.get<string>('DB_HOST'));
    console.log('API Key:', this.configService.get<string>('DB_USERNAME'));
    console.log(
      'Database Port (as number):',
      this.configService.get<number>('DB_PORT'),
    );
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
