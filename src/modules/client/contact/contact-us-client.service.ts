import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class ContactUsClientService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepo: Repository<ContactUs>,
    private readonly mailService: MailService,
  ) {}

  async submitContactForm(dto: CreateContactUsDto): Promise<ContactUs> {
    // const contact = this.contactUsRepo.create(dto);
    // const saved = await this.contactUsRepo.save(contact);

     const contact = this.contactUsRepo.create({
  ...dto,
  ...(dto.productId ? { product: { id: dto.productId } } : {}), // ✅ omit if not present
});

 const saved =  await this.contactUsRepo.save(contact);

    // ✅ Email to Admin
    try {
      await this.mailService.sendTemplateEmail({
        to: process.env.ADMIN_EMAIL || 'indigalleria@gmail.com',
        subject: `New Contact Us Submission (${dto.type})`,
        template: 'Contact_for_this_Art_Auto_Mailer_to_IndiGalleria',
        context: {
          name: dto.name,
          email: dto.email,
          mobile: dto.mobile,
          message: dto.message,
          type: dto.type,
        },
      });
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error.message);
    }

    // ✅ Email to User
    try {
      await this.mailService.sendTemplateEmail({
        to: dto.email,
        subject: 'Thank you for contacting IndiGalleria',
        template: 'Contact_for_this_Art_Auto_Mailer_to_Client',
        context: {
          name: dto.name,
          message: dto.message,
        },
      });
    } catch (error) {
      console.error('❌ Failed to send thank-you email to user:', error.message);
    }

    return saved;
  }
}
