import { IsString, Length  } from 'class-validator';

export class CreateSurfaceDto {
  @Length(5, 20)
  @IsString()
  surfaceName: string;
}
