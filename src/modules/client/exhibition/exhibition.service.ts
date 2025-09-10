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

async getExhibitionArtistsWithProductCount(exhibitionId: number) {
  const result = await this.exhibitionRepo
    .createQueryBuilder('exhibition')
    .innerJoin('exhibition.exhibitionProducts', 'exhibitionProduct')
    .innerJoin('exhibitionProduct.product', 'product')
    .innerJoin('product.artist', 'artist') // product belongs to artist
    .innerJoin('artist.roles', 'roles') // artist must have role
    .where('exhibition.id = :exhibitionId', { exhibitionId })
    .andWhere('roles.id = :roleId', { roleId: 13 }) // 13 = Artist role
    .select('exhibition.id', 'exhibitionId')
    .addSelect('artist.id', 'artistId')
    .addSelect('artist.username', 'artistName')
    .addSelect('COUNT(product.id)', 'productCount')
    .groupBy('exhibition.id')
    .addGroupBy('artist.id')
    .getRawMany();

  return result;
}
async nextonlineExhi_BKA(id: number) {
  const exhibition = await this.exhibitionRepo
    .createQueryBuilder('exhibition')
    .leftJoinAndSelect('exhibition.displayMappings', 'exhprod')
    .leftJoinAndSelect('exhprod.product', 'product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.artist', 'artist')
    .leftJoinAndSelect('artist.profileImage', 'proimg')
    .where('exhibition.id = :exhibitionId', { exhibitionId: id })
     
    
    .getOne();

  //if (!exhibition.length) throw new NotFoundException('Exhibition not found');

   

  return exhibition;
}
 
async nextonlineExhi(id: number) {
  const exhibition = await this.exhibitionRepo
    .createQueryBuilder('exhibition')
    .leftJoin('exhibition.displayMappings', 'exhprod')
    .leftJoin('exhprod.product', 'product')
    .leftJoin('product.artist', 'artist')
    .leftJoin('artist.profileImage', 'proimg')
    .where('exhibition.id = :exhibitionId', { exhibitionId: id })
    .select([
      'exhibition.id AS exhibition_id',
      'exhibition.ExibitionTitle AS exhibition_title',
      'exhibition.description AS exhibition_description',
      'exhibition.imageURL AS exhibition_imgurl',
      'exhibition.dateStart AS exhibition_startDate',
      'exhibition.dateEnd AS exhibition_endDate',
      'artist.id AS artist_id',
      'artist.username AS artist_username',
      'proimg.imageUrl AS artist_img',
    ])
    .groupBy('exhibition.id')
    .addGroupBy('artist.id')
    .getRawMany();

  if (!exhibition.length) throw new NotFoundException('Exhibition not found');

  // ✅ Now destructuring works correctly
  const {
    exhibition_id,
    exhibition_title,
    exhibition_description,
    exhibition_imgurl,
    exhibition_startDate,
    exhibition_endDate,
  } = exhibition[0];

  const result = {
    id: exhibition_id,
    title: exhibition_title,
    desc: exhibition_description,
    imgurl: exhibition_imgurl,
    startDate: exhibition_startDate,
    endDate: exhibition_endDate,
    artists: exhibition.map((e) => ({
      id: e.artist_id,
      username: e.artist_username,
      img: e.artist_img,
    })),
  };

  return result;
}



async findOnePublic(id: number): Promise<ExhibitionDetailDto> {
  const exhibition = await this.exhibitionRepo.findOne({
    where: { id, status: true },
    relations: ['displayMappings', 'displayMappings.product',
    'displayMappings.product.category','displayMappings.product.artist',
     'displayMappings.product.artist.profileImage'
    
    ]
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
