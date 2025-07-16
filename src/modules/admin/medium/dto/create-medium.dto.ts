import { IsString, Length } from 'class-validator';

export class CreateMediumDto {
  @Length(5, 20)
  @IsString()
  name: string;

   
}
