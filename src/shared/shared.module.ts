import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { S3Module } from './s3/s3.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    OtpModule, DatabaseModule,
    S3Module,
    //  RolesModule,
    // PermissionsModule,

    //RolesService,
    // PermissionsService,
  ],
  // providers: [RolesSeed],
  exports: [S3Module], // 👈 So AppModule can use it
})
export class SharedModule { }
