import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OtpVerification } from '../entities/OtpVerification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OtpVerification,User]),
  CacheModule.register({
    ttl: 60, // cache TTL in seconds
    max: 100, // maximum number of items in cache
  }),

],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService], // <--- Important
})
export class OtpModule {}
