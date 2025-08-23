// dto/create-shipping-time.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShippingTimeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
 