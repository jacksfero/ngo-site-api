import { ProductListItemDto } from "../../products/dto/product-list-item.dto";
import { ExhibitionListItemDto } from "./exhibition-list-item.dto";

export class ExhibitionDetailDto extends ExhibitionListItemDto {
  displayMappings: ProductListItemDto[];
}