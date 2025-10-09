import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsClientService } from './contact-us-client.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Controller()
export class ContactUsClientController {
  constructor(private readonly contactUsService: ContactUsClientService) {}

  @Post()
  async submitForm(@Body() dto: CreateContactUsDto) {
    const result = await this.contactUsService.submitContactForm(dto);
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
      data: result,
    };
  }
}
