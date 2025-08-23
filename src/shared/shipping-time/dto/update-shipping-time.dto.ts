import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingTimeDto } from './create-shipping-time.dto';

export class UpdateShippingTimeDto extends PartialType(CreateShippingTimeDto) {}
