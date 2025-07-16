import { PartialType } from '@nestjs/mapped-types';
import { CreateMediumDto } from './create-medium.dto';

export class UpdateMediumDto extends PartialType(CreateMediumDto) {}
