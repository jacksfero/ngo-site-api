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
    console.log(`📦 Contact created event received for:-----------44444444444----`)
    //   const template_client = 'price_request_auto_mailer_to_client';     
    //  const template_admin = 'price_request_auto_mailer_to_IndiGalleria'; 
    //  const subject_client = `Thank You for Your Interest in - ${payload.productName} | IndiGalleria`; 
    //  const subject_admin = `Price Request - ${payload.productName} (Artwork ID: IG${payload.productId})`; 
    //  const to = payload.to as string;
    //  const admin = 'info@indigalleria.com';
 const template_client = 'Contact_for_this_Art_Auto_Mailer_to_Client';     
     const template_admin = 'Contact_for_this_Art_Auto_Mailer_to_IndiGalleria'; 
     const subject_client = `Thank You for Your Artwork Inquiry - Untitled-638 | IndiGalleria`; 
     const subject_admin = `Artwork Inquiry - Untitled-638 (Artwork ID: IG638)`; 
     const to = payload.to as string;
      const admin = 'info@indigalleria.com';  
      // const to = payload.testingNote;
    if(payload.type === 'contact_for_art')
    {
    // ✅ Constant template name
     const template_client = 'Contact_for_this_Art_Auto_Mailer_to_Client';     
     const template_admin = 'Contact_for_this_Art_Auto_Mailer_to_IndiGalleria'; 
     const subject_client = `Thank You for Your Artwork Inquiry - ${payload.productName} | IndiGalleria`; 
     const subject_admin = `Artwork Inquiry - ${payload.productName} (Artwork ID: IG${payload.productId})`; 
     const to = payload.to;
     const admin = 'info@indigalleria.com';
    } 
      if(payload.type === 'price_request')
    {
    // ✅ Constant template name
     const template_client = 'price_request_auto_mailer_to_client';     
     const template_admin = 'price_request_auto_mailer_to_IndiGalleria'; 
     const subject_client = `Thank You for Your Interest in - ${payload.productName} | IndiGalleria`; 
     const subject_admin = `Price Request - ${payload.productName} (Artwork ID: IG${payload.productId})`; 
     const to = payload.to;
     const admin = 'info@indigalleria.com';
    } 
  

    
    try {

     //for client
      await this.mailService.sendTemplateEmail({
        to,        
        subject: subject_client,
        template:template_admin,
        context: payload,
      });
      // for admin 
      await this.mailService.sendTemplateEmail({
        to: admin,        
        subject: subject_admin,
        template:template_admin,
        context: payload,
      });














      this.logger.log(`✅ Contact creation email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send Contact creation email`, error);
    }
  }
}
