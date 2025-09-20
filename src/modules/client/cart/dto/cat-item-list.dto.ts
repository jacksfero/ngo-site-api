import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class InventoryDto {
    @Expose() id: number;
    @Expose() price: number;
    @Expose() discount: number;
    @Expose() gstSlot: number; 
    @Expose() shippingSlot: number;
}

@Exclude()
export class ProductDto {
    @Expose()
    id: number;

    @Expose()
    productTitle: string;

    @Expose()
    slug: string;
    
    @Expose()
    defaultImage: string;

    @Expose()
    @Type(() => InventoryDto)
    productInventory: InventoryDto;
}

@Exclude()
export class CartItemDto {
    @Expose()
    id: number;

    @Expose()
    quantity: number;

    @Expose()
    product_id: number;
 
    @Expose()
    @Type(() => ProductDto)
    product: ProductDto;
}

@Exclude()
export class UserDto {
    @Expose() id: number;
    @Expose() username: string;
}

@Exclude()
export class CartItemListDto {
    @Expose() id: number;
    @Expose() isCheckedOut: boolean;

    @Expose()
    @Type(() => CartItemDto)
    items: CartItemDto[];

    @Expose()
    @Type(() => UserDto)
    user: UserDto;
}
