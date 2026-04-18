import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform,Type } from 'class-transformer';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';


export class ContentPaginationDto extends PaginationBaseDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  status?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // @Transform(({ value }) => value === 'true' || value === true)
  // is_verified?: boolean;

  // @IsOptional()
  // @IsString()
  // userTypeID?: string;
}
