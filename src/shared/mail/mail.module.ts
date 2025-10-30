import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
 

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [MailService, ],
  exports: [MailService], // 👈 make MailService usable in any module
})
export class MailModule {}
