import { PartialType } from '@nestjs/mapped-types';
import { CreateCommissionTypeDto } from './create-commision-type.dto';
 

export class UpdateCommisionTypeDto extends PartialType(CreateCommissionTypeDto) {}
