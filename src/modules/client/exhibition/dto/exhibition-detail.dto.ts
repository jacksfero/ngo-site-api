import { Exclude, Expose, Type } from 'class-transformer';
import { ProductListItemDto,ExhiProductListItemDto } from "../../products/dto/product-list-item.dto";
import { ExhibitionListItemDto } from "./exhibition-list-item.dto";

@Exclude()
export class ExhibitionDetailDto extends ExhibitionListItemDto {
  @Expose()
  displayMappings: ProductListItemDto[];
}



@Exclude()
export class ExhibitionDetailDtos extends ExhibitionListItemDto {
  @Expose()
  displayMappings: ExhiProductListItemDto[];
}

