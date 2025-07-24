import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { Equal, Repository } from 'typeorm';
 
import { ExhibitionProduct } from 'src/shared/entities/exhibition-product.entity';
import { Product } from 'src/shared/entities/product.entity';

@Injectable()
export class ExhibitionService {

  constructor(
    @InjectRepository(Exhibition)
    private exhibitionRepository: Repository<Exhibition>,

     @InjectRepository(ExhibitionProduct)
    private exhibitionProductRepository: Repository<ExhibitionProduct>,


  ) { }


  async create(dto: CreateExhibitionDto, user: any): Promise<Exhibition> {

    const exhibition = this.exhibitionRepository.create({
      ExibitionTitle: dto.ExibitionTitle,


      description: dto.description,
      imageURL: 'test',
      // imageURL: imagePath ? `/uploads/exhibition-images/${imagePath}` : null,

     dateStart: dto.dateStart,
      dateEnd: dto.dateEnd,
      createdBy:user.sub.toString(),

    });
    return this.exhibitionRepository.save(exhibition);

  }

 async findAll() :Promise<Exhibition[]> {
    const result = await this.exhibitionRepository.find();
    return result;
  }

async  findOne(id: number):Promise<Exhibition> {
      const exhibition = await this.exhibitionRepository.findOne({ where: { id } });
         if (!exhibition) throw new NotFoundException(`exhibition ${id} not found`);
         return exhibition;
  }

  update(id: number, updateExhibitionDto: UpdateExhibitionDto) {
    return `This action updates a #${id} exhibition`;
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

 async getMappedProducts(displayId: number): Promise<Product[]> {
    const mappings = await this.exhibitionProductRepository.find({
      where: { exhibition: { id: displayId } },
      relations: ['product'],
    });

    return mappings.map((m) => m.product);
  }

    async addProductMapping(displayId: number, productId: number, userId: number): Promise<ExhibitionProduct> {
    const mapping = this.exhibitionProductRepository.create({
      exhibition: { id: displayId },
      product: { id: productId },
       user: { id: userId },
    });

    return this.exhibitionProductRepository.save(mapping);
  }



  async removeProductMapping(mappingId: number): Promise<void> {
    const mapping = await this.exhibitionProductRepository.findOneBy({ id: mappingId });
    if (!mapping) throw new NotFoundException('Mapping not found');
    await this.exhibitionProductRepository.remove(mapping);
  }




}
