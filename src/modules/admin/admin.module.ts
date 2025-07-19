import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';

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

import { SurfaceModule } from './surface/surface.module';
import { SubjectModule } from './subject/subject.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
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

    RouterModule.register([
      {
        path: 'admin', // Prefix for all child routes
        children: [
          { path: 'users', module: UsersModule },
          { path: 'roles', module: RolesModule },
          { path: 'permissions', module: PermissionsModule },
          { path: 'surfaces', module: SurfaceModule },
          { path: 'wishlists', module: WishlistModule },
          { path: 'videos', module: VideoModule },
          { path: 'subjects', module: SubjectModule },
          { path: 'shippings', module: ShippingModule },
          { path: 'styles', module: StyleModule },
          { path: 'products', module: ProductModule },
          { path: 'policies', module: PolicyModule },
          { path: 'mediums', module: MediumModule },
          { path: 'exhibitions', module: ExhibitionModule },
          { path: 'currencies', module: CurrencyModule },
          { path: 'contactus', module: ContactusModule },
          { path: 'blogs', module: BlogModule },
          { path: 'contents', module: ContentModule },
        ],
      },
    ]),
  ],
  providers: [
     { provide: APP_GUARD, useClass: JwtAuthGuard },
  //{ provide: APP_GUARD, useClass: RolesGuard },
  //{ provide: APP_GUARD, useClass: PermissionsGuard },
  ],

})
export class AdminModule {}
