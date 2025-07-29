import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ExhibitionListItemDto } from './dto/exhibition-list-item.dto';
import { ExhibitionDetailDto } from './dto/exhibition-detail.dto';
import { ProductListItemDto } from '../products/dto/product-list-item.dto';

  
@Injectable()
export class ExhibitionService {
  constructor(
     @InjectRepository(Exhibition)
    private exhibitionRepo: Repository<Exhibition>,

  ){}
  

  async findPublicAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<ExhibitionListItemDto>> {
  const { page = 1, limit = 10 } = paginationDto;
//console.log('aaaaaaaaaaaaaaaa================');
  const query = this.exhibitionRepo.createQueryBuilder('exhibition')
    .where('exhibition.status = :status', { status: true })
    .orderBy('exhibition.dateStart', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [items, total] = await query.getManyAndCount();

  return new PaginationResponseDto(
    plainToInstance(ExhibitionListItemDto, items),
    { total, page, limit }
  );
}


 
async findOnePublic(id: number): Promise<ExhibitionDetailDto> {
  const exhibition = await this.exhibitionRepo.findOne({
    where: { id, status: true },
    relations: ['displayMappings', 'displayMappings.product', 'displayMappings.product.images', 'displayMappings.product.artist']
  });

  if (!exhibition) throw new NotFoundException('Exhibition not found');

  const dto = plainToInstance(ExhibitionDetailDto, exhibition);

  // ✅ Convert to ProductListItemDto
  // dto.displayMappings = exhibition.displayMappings.map((mapping) =>
  //   plainToInstance(ProductListItemDto, mapping.product)
  // );

  dto.displayMappings = exhibition.displayMappings.map((mapping) =>
  plainToInstance(ProductListItemDto, mapping.product, { excludeExtraneousValues: true })
);

  return dto;
}


}
