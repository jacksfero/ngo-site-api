import { IsString, Length } from 'class-validator';

export class CreateShippingDto {
  @Length(5, 30)
  @IsString()
  weightSlot: string;
}
