import { Module,forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OtpVerification } from '../entities/OtpVerification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { OtpCronService } from './otp-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpVerification,User]),
  CacheModule.register({
    ttl: 60, // cache TTL in seconds
    max: 100, // maximum number of items in cache
  }),
 forwardRef(() => AuthModule), // ✅ put this back
],
  controllers: [OtpController],
  providers: [OtpService,OtpCronService],
  exports: [OtpService], // <--- Important
})
export class OtpModule {

  constructor() {
    console.log('🚀 OtpModule initialized');
  }
}
