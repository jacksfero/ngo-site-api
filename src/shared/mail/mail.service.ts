import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID_SESMAIL');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY_SESMAIL');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    const fromEmail = this.configService.get<string>('SES_FROM_EMAIL');

    // ✅ Safe guard — throw error if not set
    if (!accessKeyId || !secretAccessKey || !fromEmail) {
      this.logger.error('Missing AWS SES environment variables');
      throw new Error('Missing AWS SES credentials or FROM email');
    }

    this.fromEmail = fromEmail;

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,      // ✅ now guaranteed to be string
        secretAccessKey,  // ✅ same here
      },
    });
  }

  /**
   * Send email using AWS SES API + Handlebars template
   */
  async sendTemplateEmail(
    to: string,
    templateName: string,
    context: Record<string, any>,
    subject: string,
  ): Promise<void> {
    try {
      // ✅ Template path in dist folder
      const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateSource);
      const htmlBody = compiledTemplate(context);

      const command = new SendEmailCommand({
        Destination: { ToAddresses: [to] },
        Message: {
          Body: { Html: { Charset: 'UTF-8', Data: htmlBody } },
          Subject: { Charset: 'UTF-8', Data: subject },
        },
        Source: this.fromEmail,
      });

      await this.sesClient.send(command);
      this.logger.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
