export class ProductListItemDto {
  id: number;
  productTitle: string;
  artist_price: number;
  defaultImage: string;
  createdAt: Date;

  category?: {
    id: number;
    name: string;
  };

  images?: {
    id: number;
    imagePath: string;
  }[];

  owner?: {
    id: number;
    username: string;
  };

  artist?: {
    id: number;
    username: string;
  };
}
