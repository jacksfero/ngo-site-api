import { Module } from '@nestjs/common';
import { MediumModule } from './medium/medium.module';
import { ShippingModule } from './shipping/shipping.module';
import { CurrencyModule } from './currency/currency.module';
import { StyleModule } from './style/style.module';
import { PolicyModule } from './policy/policy.module';
import { ContentModule } from './content/content.module';
import { BlogModule } from './blog/blog.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { VideoModule } from './video/video.module';
import { ContactusModule } from './contactus/contactus.module';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ProductModule } from './product/product.module';
//import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    MediumModule,
    ShippingModule,
    CurrencyModule,
    StyleModule,
    PolicyModule,
    ContentModule,
    BlogModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    VideoModule,
    ContactusModule,
    ExhibitionModule,
    WishlistModule,
    ProductModule,
    //  InventoryModule,
  ],
})
export class AdminModule {}
