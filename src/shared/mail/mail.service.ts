import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';


interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string; // template name without extension
  context: Record<string, any>; // dynamic data for template
}


@Injectable()
export class MailService {

constructor(private readonly mailerService: MailerService) {}


 

  async sendMail(options: SendMailOptions) {
    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: `./${options.template}`, // path relative to templates dir
      context: options.context,
    });
  }
 






  create(createMailDto: CreateMailDto) {
    return 'This action adds a new mail';
  }

  findAll() {
    return `This action returns all mail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  update(id: number, updateMailDto: UpdateMailDto) {
    return `This action updates a #${id} mail`;
  }

  remove(id: number) {
    return `This action removes a #${id} mail`;
  }
}
