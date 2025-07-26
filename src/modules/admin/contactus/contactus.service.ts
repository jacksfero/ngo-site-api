import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateContactUsDto } from './dto/create-contactus.dto';
import { UpdateContactUsDto } from './dto/update-contactus.dto';
import { ContactUs } from 'src/shared/entities/contactus.entity';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
 

@Injectable()
export class ContactUsService {


  constructor(
    @InjectRepository(ContactUs)
    private contactRepo: Repository<ContactUs>,
  ) { }

 async create(dto: CreateContactUsDto) {
 const contact = this.contactRepo.create({
  ...dto,
  ...(dto.productId ? { product: { id: dto.productId } } : {}), // ✅ omit if not present
});

  await this.contactRepo.save(contact);
 // await this.mailService.sendContactEmail(contact);
  return contact;
}
 
 

  async findAll(
  paginationDto: PaginationDto,
): Promise<PaginationResponseDto<CreateContactUsDto>> {
  const { page = 1, limit = 10, search } = paginationDto;
  const skip = (page - 1) * limit;
  const searchTerm = search?.toLowerCase() || '';

  const whereClause = searchTerm
    ? [
        { name: Like(`%${searchTerm}%`) },
        { email: Like(`%${searchTerm}%`) },
        { subject: Like(`%${searchTerm}%`) },
      ]
    : {};

  const [result, total] = await this.contactRepo.findAndCount({
    where: whereClause,
    take: limit,
    skip,
    order: { createdAt: 'DESC' },
  });

 const data = plainToInstance(CreateContactUsDto, result); // returns CreateContactUsDto[]

  return new PaginationResponseDto<CreateContactUsDto>(data, {
    total,
    page,
    limit,
  });
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
