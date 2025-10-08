import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { join } from 'path';

@Global() // 👈 makes MailService available everywhere
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SES_SMTP_HOST, // e.g. email-smtp.ap-south-1.amazonaws.com
        port: 587, // 587 (TLS) or 465 (SSL)
        secure: false, // true for 465, false for 587
        auth: {
          user: process.env.SES_SMTP_USER, // SES SMTP username
          pass: process.env.SES_SMTP_PASS, // SES SMTP password
        },
      },
      defaults: {
        from: `"Support Team" <${process.env.SES_FROM_EMAIL}>`, // must be verified in SES
      },
       template: {
          dir: join(__dirname, 'templates'), // __dirname is dist/shared/mail
      //  dir: join(process.cwd(), 'src', 'shared', 'mail', 'templates'), // ✅ correct path
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
   exports: [MailService], // 👈 export for global use
})
export class MailModule {}
