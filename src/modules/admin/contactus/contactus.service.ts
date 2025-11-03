import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { ContactPaginationDto } from './dto/contact-pagination.dto';
import { ContactListDto } from './dto/contact-list.dto';
//import { MailService } from 'src/shared/mail/mail.service';
import { CacheService } from 'src/core/cache/cache.service';
 

@Injectable()
export class ContactUsService {


  constructor(
      private cacheService: CacheService,

    @InjectRepository(ContactUs)
    private contactRepo: Repository<ContactUs>,

     // private readonly mailService: MailService,
  ) { }

 async create(dto: CreateContactUsDto) {
 const contact = this.contactRepo.create({
  ...dto,
    ...(dto.productName ? { productName: dto.productName } : {}),
   ...(dto.productId ? { productId: dto.productId } : {}),
});

  await this.contactRepo.save(contact);
  /*await this.mailService.sendMail({
  to: 'admin@example.com',
  subject: `New Contact Enquiry: ${dto.subject}`,
  template: 'contact-us', // ⬅️ matches contact-us.hbs
  context: {
    name: contact.name,
    email: contact.email,
    mobile: contact.mobile,
    subject: contact.subject,
    message: contact.message,
  },
});*/
  return contact;
}

// async clearCache(): Promise<{ success: boolean; message: string }> {
//   try {
//     await this.cacheService.deletePattern('Admin:*');
//     await this.cacheService.deletePattern('frontend:*');
    
//     return {
//       success: true,
//       message: 'Cache cleared successfully'
//     };
//   } catch (error) {
//     // Log the error for debugging
//     console.error('Cache clearance failed:', error);
    
//     return {
//       success: false,
//       message: 'Failed to clear cache'
//     };
//   }
// }

 async findAll(
  paginationDto: ContactPaginationDto,
): Promise<PaginationResponseDto<ContactListDto>> {
  const { page, type, limit, search } = paginationDto;
  const skip = (page - 1) * limit;

  const cacheKey = this.cacheService.generateKey(
    'contactslist',    
    JSON.stringify({ page, type, limit, search })
  );

  const cached = await this.cacheService.get<PaginationResponseDto<ContactListDto>>(cacheKey);
  if (cached) {
    console.log('✅ Returning cached contacts data');
    return cached;
  }

  const queryBuilder = this.contactRepo.createQueryBuilder('contact');
   // .leftJoinAndSelect('contact.product', 'product');

  if (search) {
    queryBuilder.andWhere(
      `(
        LOWER(contact.name) LIKE LOWER(:search) OR 
        LOWER(contact.email) LIKE LOWER(:search) OR 
        LOWER(contact.subject) LIKE LOWER(:search)
      )`,
      { search: `%${search}%` }
    );
  }

  if (type) {
    queryBuilder.andWhere('contact.type = :type', { type });
  }

  const [result, total] = await queryBuilder
    .orderBy('contact.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  // ✅ FIXED: Manual transformation to avoid circular references
  const data = this.transformContactsToDto(result);

  const response = new PaginationResponseDto<ContactListDto>(data, {
    total,
    page,
    limit,
  });

  await this.cacheService.set(cacheKey, response, { ttl: 300 });

  return response;
}

// ✅ Safe transformation method
private transformContactsToDto(contacts: ContactUs[]): ContactListDto[] {
  return contacts.map(contact => {
    const dto = new ContactListDto();
    
    // Basic contact fields
    dto.id = contact.id;
     dto.product_id = contact.product_id;
      dto.productName = contact.productName;
    dto.name = contact.name;
    dto.phonecode = contact.phonecode;
    dto.mobile = contact.mobile;
    dto.email = contact.email;
    dto.message = contact.message;
    dto.type = contact.type;
    dto.subject = contact.subject;
    dto.createdAt = contact.createdAt;
   // dto.updatedAt = contact.updatedAt;
    
    // ✅ Safe product transformation
    // if (contact.product) {
    //   dto.product = {
    //     id: contact.product.id,
    //     productTitle: `${contact.product.productTitle} (${contact.product.id})` // formatted title
    //   };
    // } else {
    //   dto.product = null;
    // }
    
    return dto;
  });
}
 
  async findAllsssssss(
  paginationDto: ContactPaginationDto,
): Promise<PaginationResponseDto<ContactListDto>> {
  const { page ,type, limit, search } = paginationDto;
  const skip = (page - 1) * limit;

   // ✅ Generate unique cache key based on all parameters
  const cacheKey = this.cacheService.generateKey(
    'contactslist',    
    JSON.stringify({ page, type, limit, search })
  );
  // ✅ Check cache first
  const cached = await this.cacheService.get<PaginationResponseDto<ContactListDto>>(cacheKey);
  if (cached) {
    console.log('✅ Returning cached contacts data');
   // return cached;
  }
  const queryBuilder = this.contactRepo.createQueryBuilder('contact')
                      .leftJoinAndSelect('contact.product','product');
    // Build WHERE conditions
  if (search) {
    queryBuilder.andWhere(
      `(
        LOWER(contact.name) LIKE LOWER(:search) OR 
        LOWER(contact.email) LIKE LOWER(:search) OR 
        LOWER(contact.subject) LIKE LOWER(:search)
      )`,
      { search: `%${search}%` }
    );
  }
   if (type) {
    queryBuilder.andWhere('contact.type = :type', { type });
  }
  
  const [result, total] = await queryBuilder
    .orderBy('contact.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();
 //   console.log('SQL:', queryBuilder.getSql());
//console.log('Parameters:', queryBuilder.getParameters());
  //  console.log('Raw result:', JSON.stringify(result, null, 2));
//console.log('aaaaaaaaaaaa');
 const data = plainToInstance(ContactListDto, result, {
    excludeExtraneousValues: true,
  });

const  response = new PaginationResponseDto<ContactListDto>(data, {
    total,
    page,
    limit,
  });
   // ✅ Cache the response with reasonable TTL
  await this.cacheService.set(cacheKey, response); // 5 minutes

  return response;
}


  async findOne(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }
  async update(id: number, dto: UpdateContactUsDto) {
    await this.findOne(id);
    await this.contactRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.contactRepo.delete(id);
  }
}
