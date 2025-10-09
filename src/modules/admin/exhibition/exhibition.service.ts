import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { Equal, Repository } from 'typeorm';
 
import { ExhibitionProduct } from 'src/shared/entities/exhibition-product.entity';
import { Product } from 'src/shared/entities/product.entity';
import { User } from 'src/shared/entities/user.entity';
import { S3Service } from 'src/shared/s3/s3.service';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class ExhibitionService {

  constructor(
    private readonly s3service: S3Service,

      private readonly cacheService: CacheService,


    @InjectRepository(Exhibition)
    private exhibitionRepository: Repository<Exhibition>,

     @InjectRepository(ExhibitionProduct)
    private exhibitionProductRepository: Repository<ExhibitionProduct>,
  ) {}


  async create(dto: CreateExhibitionDto, user: any, imageURL?:Express.Multer.File | null): Promise<Exhibition> {
    let titleImage: string | null = null;

    if(imageURL){
      const key = `exhibitions/${Date.now()}-${imageURL.originalname}`;
      titleImage = 
    await this.s3service.uploadBuffer(key, imageURL.buffer, imageURL.mimetype); 
    }
    const exhibition = this.exhibitionRepository.create({
      ExibitionTitle: dto.ExibitionTitle, 
      description: dto.description,
       imageURL: titleImage, 
     dateStart: dto.dateStart,
      dateEnd: dto.dateEnd,
      createdBy:user.sub.toString(),

    });
    const exhi = await this.exhibitionRepository.save(exhibition);

     await this.cacheService.deletePattern('frontend:artwork:exhibition:*');

  return exhi;
  }

 async findAll() :Promise<Exhibition[]> {
     const result = await this.exhibitionRepository.find({
      order: {
        id: 'DESC', // sort by newest first
      },

     });
     return result;

  /*   return this.exhibitionRepository.find({
      relations: [
      'displayMappings',
      'displayMappings.product',
      'displayMappings.user',
    ],
      order: { createdAt: 'DESC' },
    });*/
  }


  

async  findOne(id: number):Promise<Exhibition> {
      const exhibition = await this.exhibitionRepository.findOne({        
        where: { id } ,
        relations:[
          'displayMappings',
          'displayMappings.product','displayMappings.product.artist'
        ]
      
      });
         if (!exhibition) throw new NotFoundException(`exhibition ${id} not found`);
         return exhibition;
  }
 
    async update(id: number, dto: UpdateExhibitionDto,user:any,imageURL?:Express.Multer.File | null): Promise<Exhibition> {
      let titleImage: string | null = null;
      const exhibition = await this.findOne(id);
      if (!exhibition) throw new NotFoundException('exhibition not found');
      if (imageURL) {

        const key = `exhibitions/${Date.now()}-${imageURL.originalname}`;
      
        // Upload new image
        const titleImage = await this.s3service.uploadBuffer(
          key,
          imageURL.buffer,
          imageURL.mimetype
        );
        // Delete old image if exists
      if (exhibition.imageURL) {
       // const oldKey = this.extractS3Key(blog.titleImage);
        await this.s3service.deleteObject(exhibition.imageURL);
      } 
        // Save new image path/URL
        exhibition.imageURL = titleImage;
            
      }

    Object.assign(exhibition,dto);
    exhibition.updatedBy = user.sub.toString();
    const exhit = await this.exhibitionRepository.save(exhibition);

     await this.cacheService.deletePattern('frontend:artwork:exhibition:*');

     return exhit;
  }


  

  async remove(id: number):Promise<void> {

    const usersToRemove = await this.exhibitionProductRepository.find({ 
  where: { 
    exhibition: Equal(id) 
  }
});
    this.exhibitionProductRepository.remove(usersToRemove);

    const mapping = await this.exhibitionRepository.findOneBy({ id: id });
    if (!mapping) throw new NotFoundException('Mapping not found');
    await this.exhibitionRepository.remove(mapping);
  }

  async toggleStatus(id: number, user: any): Promise<Exhibition> {
    const Exhibition = await this.exhibitionRepository.findOne({ where: { id } });
    if (!Exhibition) {
      throw new NotFoundException(`policy   with ID ${id} not found`);
    }
    Exhibition.status = !Exhibition.status;
    Exhibition.updatedBy = user.sub.toString(); // or user.sub.toString()

   const exhit =await this.exhibitionRepository.save(Exhibition);

     await this.cacheService.deletePattern('frontend:artwork:exhibition:*');

     return exhit;
  }

 async getMappedProducts(displayId: number): Promise<
  {
    displayId: number;
    product: { id: number; title: string, image:string|null};
    user: { id: number; name: string };
  }[]
> {
  const mappings = await this.exhibitionProductRepository.find({
    where: { exhibition: { id: displayId } },
    relations: ['product', 'exhibition', 'user'], // include user too
  });

 return mappings.map((m) => ({
  displayId: m.exhibition.id,
  exhId_pid:m.id,
  product: {
    id: m.product.id,
    title: m.product.productTitle,
    image: m.product.defaultImage ? m.product.defaultImage: null,
  },
  user: {
    id: m.user.id,
    name: m.user.username,
  },
}));
}

    async addProductMapping(displayId: number, productId: number, userId: number): Promise<ExhibitionProduct> {
    const mapping = this.exhibitionProductRepository.create({
      exhibition: { id: displayId },
      product: { id: productId },
       user: { id: userId },
    });

    const exhit = await this.exhibitionProductRepository.save(mapping);
 await this.cacheService.deletePattern('frontend:artwork:exhibition:*');

     return exhit;
    
  }



  async removeProductMapping(mappingId: number): Promise<void> {
    const mapping = await this.exhibitionProductRepository.findOneBy({ id: mappingId });
    if (!mapping) throw new NotFoundException('Mapping not found');
    await this.exhibitionProductRepository.remove(mapping);

     
 await this.cacheService.deletePattern('frontend:artwork:exhibition:*');

     
  }




}
