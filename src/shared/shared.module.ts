import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { S3Module } from './s3/s3.module';
import { OtpModule } from './otp/otp.module';
import { DatabaseModule } from './database/database.module';
 
import { PackingModeModule } from './packing-mode/packing-mode.module';
import { CommisionTypeModule } from './commision-type/commision-type.module';
import { ShippingTimeModule } from './shipping-time/shipping-time.module';
import { SizeModule } from './size/size.module';
import { OrientationModule } from './orientation/orientation.module';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mail/mail.module';
import { EventsModule } from './events/events.module'; // 👈 import this
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    OtpModule, DatabaseModule,
    S3Module,
    MailModule, SmsModule,
    EventsModule,
    PackingModeModule,
    PaymentModule,
    
    CommisionTypeModule,
    
    ShippingTimeModule,
    
    SizeModule,
    
    OrientationModule,
    //  RolesModule,
    // PermissionsModule,

    //RolesService,
    // PermissionsService,
  ],
  // providers: [RolesSeed],
  
  exports: [S3Module], // 👈 So AppModule can use it
})
export class SharedModule { }
