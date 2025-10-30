import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
 
import { CreateNewsletterDto } from './dto/newsletter.contact.dto';
import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContactCreatedPayload } from 'src/shared/events/interfaces/event-payload.interface';

@Injectable()
export class ContactUsClientService {
  constructor(
     private readonly eventEmitter: EventEmitter2,

    @InjectRepository(ContactUs)
    private readonly contactUsRepo: Repository<ContactUs>,
    
  ) {}

  async submitContactForm(dto: CreateContactUsDto): Promise<ContactUs> {
    
     const contact = this.contactUsRepo.create({
  ...dto,
   ...(dto.productName ? { productName: dto.productName } : {}),
   ...(dto.productId ? { productId: dto.productId } : {}),
 // ...(dto.productId ? { product: { id: dto.productId } } : {}), // ✅ omit if not present
});

 const saved =  await this.contactUsRepo.save(contact);
  dto.productName = 'Testing Product';
 dto.productId = 6;
 // dto.email = 'jayprakash005@gmail.com';
    // ✅ Email to Admin
    try {
       
      // 2️⃣ Emit email event (async background process)
           const payload: ContactCreatedPayload = {           
            context: { 
            },
          name: dto.name,
          to: dto.email,
          mobile: dto.mobile,
          message: dto.message,
          type: dto.type,    
          productName:dto.productName,
          productId:dto.productId,

          };
           this.eventEmitter.emit('contact.created', payload);
            
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error.message);
    }

  
    return saved;
  }

  async NewsletterSubmitForm(dto: CreateNewsletterDto): Promise<ContactUs> {
    // const contact = this.contactUsRepo.create(dto);
    // const saved = await this.contactUsRepo.save(contact);

    const contact = this.contactUsRepo.create({
    type: ContactUsType.NEWSLETTER,
  
    email: dto.email,
    
    // ... other fields
  });

 const saved =  await this.contactUsRepo.save(contact);

   /* // ✅ Email to Admin
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
    }*/

    return saved;
  }

  
}
