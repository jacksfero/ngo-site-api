import { Module, Logger, OnModuleInit } from '@nestjs/common';
 

import { AppController } from './app.controller';
import { AppService } from './app.service';

//import { TypeOrmModule } from '@nestjs/typeorm';
 
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
 
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesSeed } from './shared/database/seeds/roles.seed';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { GlobalModule } from './global/global.module';
import { PublicGuard } from './core/guards/public.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    DatabaseModule,
    AuthModule,  
    AdminModule,
    ClientModule,
    GlobalModule,
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
