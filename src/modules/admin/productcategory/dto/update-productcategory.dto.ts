import { PartialType } from '@nestjs/mapped-types';
import { CreateProductcategoryDto } from './create-productcategory.dto';

export class UpdateProductcategoryDto extends PartialType(CreateProductcategoryDto) {}
