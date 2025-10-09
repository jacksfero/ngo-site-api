import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(
    @Body()
    body: {
      to: string;
      subject: string;
      template: string;
      context: Record<string, any>;
      cc?: string | string[];
      bcc?: string | string[];
    },
  ) {
    await this.mailService.sendTemplateEmail({
      to: body.to,
      subject: body.subject,
      template: body.template,
      context: body.context,
      cc: body.cc,
      bcc: body.bcc,
    });

    return { success: true, message: 'Email sent successfully' };
  }
}

/*
await this.mailService.sendTemplateEmail({
  to: 'jayprakash005@gmail.com',
  cc: ['support@indigalleria.com', 'team@indigalleria.com'],
  bcc: 'admin@indigalleria.com',
  subject: 'Welcome to IndiGalleria 🎨',
  template: 'welcome', // corresponds to welcome.hbs
  context: {
    name: 'Jay Prakash',
    appUrl: 'https://indigalleria.com',
  },
});*/