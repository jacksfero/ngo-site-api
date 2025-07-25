import { PartialType } from '@nestjs/mapped-types';
import { CreateContactUsDto } from './create-contactus.dto';

export class UpdateContactUsDto extends PartialType(CreateContactUsDto) {}
