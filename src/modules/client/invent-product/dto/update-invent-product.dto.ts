import { PartialType } from '@nestjs/mapped-types';
import { CreateInventProductDto } from './create-invent-product.dto';

export class UpdateInventProductDto extends PartialType(CreateInventProductDto) {}
