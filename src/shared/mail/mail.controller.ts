import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendEmail(
    @Body('to') to: string,
    @Body('template') template: string,
    @Body('subject') subject: string,
    @Body('context') context: Record<string, any>,
  ) {
    const result = await this.mailService.sendTemplateEmail(to, template, context, subject);
    return {
      success: true,
      message: 'Email sent successfully',
     // messageId: result.MessageId,
    };
  }
}
