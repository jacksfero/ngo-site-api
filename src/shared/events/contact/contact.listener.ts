// src/modules/product/listeners/product.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContactCreatedPayload } from '../interfaces/event-payload.interface';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class ContactListener {
  private readonly logger = new Logger(ContactListener.name);
     
  constructor(private readonly mailService: MailService) {}

 
  @OnEvent('contact.created', { async: true })
async handleContactCreated(payload: ContactCreatedPayload) {
  this.logger.log(`📦 Contact created event received for: ${payload.productName}`);
  console.log(`📦 Contact created event received for:-----------44444444444----`);

  // Default values (for normal contact us)
  let template_client = 'Contactus_Mailer_to_Client';     
  let template_admin = 'Contactus_Mailer_to_IndiGalleria'; 
  let subject_client = `Thank You for Reaching Out – IndiGalleria`; 
  let subject_admin = `New Contact Us Submission from ${payload.name}`; 
  let to = payload.to as string;
  let admin = 'info@indigalleria.com';  

  // ✅ contact_for_art type
  if (payload.type === 'contact_for_art') {
    console.log('contact_for_art Request ----------------------------');
    template_client = 'Contact_for_this_Art_Auto_Mailer_to_Client';     
    template_admin = 'Contact_for_this_Art_Auto_Mailer_to_IndiGalleria'; 
    subject_client = `Thank You for Your Artwork Inquiry - ${payload.productName} | IndiGalleria`; 
    subject_admin = `Artwork Inquiry - ${payload.productName} (Artwork ID: IG${payload.productId})`; 
  }

  // ✅ price_request type
  else if (payload.type === 'price_request') {
    console.log('Price Request ----------------------------');
    template_client = 'price_request_auto_mailer_to_client';     
    template_admin = 'price_request_auto_mailer_to_IndiGalleria'; 
    subject_client = `Thank You for Your Interest in - ${payload.productName} | IndiGalleria`; 
    subject_admin = `Price Request - ${payload.productName} (Artwork ID: IG${payload.productId})`; 
  }

  try {
    // for client
    await this.mailService.sendTemplateEmail({
      to,        
      subject: subject_client,
      template: template_client, // 👈 fixed: was using template_admin by mistake
      context: payload,
    });

    // for admin
    await this.mailService.sendTemplateEmail({
      to: admin,        
      subject: subject_admin,
      template: template_admin,
      context: payload,
    });

    this.logger.log(`✅ Contact creation email sent to ${payload.to}`);
  } catch (error) {
    this.logger.error(`❌ Failed to send Contact creation email`, error);
  }
}

}
