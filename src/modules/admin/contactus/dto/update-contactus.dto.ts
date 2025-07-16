import { PartialType } from '@nestjs/mapped-types';
import { CreateContactusDto } from './create-contactus.dto';

export class UpdateContactusDto extends PartialType(CreateContactusDto) {}
