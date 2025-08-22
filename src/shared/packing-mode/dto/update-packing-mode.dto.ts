import { PartialType } from '@nestjs/mapped-types';
import { CreatePackingModeDto } from './create-packing-mode.dto';

export class UpdatePackingModeDto extends PartialType(CreatePackingModeDto) {}
