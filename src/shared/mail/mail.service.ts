import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

 
import * as fs from 'fs';
import * as path from 'path';
 

interface MailTemplateData {
  [key: string]: any;
}


interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string; // filename without .hbs
  context?: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
}

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

    this.registerPartials();
  }

async sendTemplateEmail(options: SendMailOptions): Promise<void> {

const mailEnabled = this.configService.get<string>('MAIL_ENABLED') === 'true';

  // ✅ If mail disabled, skip sending
  if (!mailEnabled) {
    this.logger.warn(`🚫 Mail sending disabled. Skipped email to ${options.to}`);
    return;
  }

    try {
      // ✅ Build template file path
      const templatePath = path.join(
        __dirname,
        'templates',
        `${options.template}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const source = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(source);
      const html = template(options.context || {});

      // ✅ Build SES params
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
          CcAddresses: options.cc
            ? Array.isArray(options.cc)
              ? options.cc
              : options.cc.split(',').map((x) => x.trim())
            : [],
          BccAddresses: options.bcc
            ? Array.isArray(options.bcc)
              ? options.bcc
              : options.bcc.split(',').map((x) => x.trim())
            : [],
        },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            Html: { Data: html },
          },
        },
      };

      // ✅ Send using AWS SES
      await this.sesClient.send(new SendEmailCommand(params));
      this.logger.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }
private registerPartials(): void {
    const partialsDir = path.join(__dirname, 'templates', 'partials');
    if (fs.existsSync(partialsDir)) {
      const files = fs.readdirSync(partialsDir);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const partialName = path.basename(file, '.hbs');
          const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf8');
          Handlebars.registerPartial(partialName, partialContent);
        }
      }
      this.logger.log(`📄 Loaded ${files.length} Handlebars partials`);
    } else {
      this.logger.warn(`⚠️ Partials directory not found: ${partialsDir}`);
    }
  }



  /**
   * Send email using AWS SES API + Handlebars template
   */
  async sendTemplateEmailss(
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
