import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

import { join } from 'path';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // or your SMTP server
        port: 587,
        secure: false,
        auth: {
          user: 'your_email@gmail.com',
          pass: 'your_app_password', // App-specific password or SMTP credentials
        },
      },
      defaults: {
        from: '"Support Team" <your_email@gmail.com>',
      },
       template: {
    dir: join(__dirname, '..', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
    }
  })
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
