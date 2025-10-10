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
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { AdminCompositeGuard } from 'src/core/guards/admin-composite.guard';
import { AuthModule } from '../auth/auth.module';
import { ProductcategoryModule } from './productcategory/productcategory.module';
import { MediaModule } from './media/media.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { CartAdminController } from './cart/cart.controller';
import { CartAdminModule } from './cart/cart.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { MisModule } from './mis/mis.module';
 

@Module({
  imports: [
    AuthModule,
    MediumModule,
    ShippingModule,
    CurrencyModule,
    StyleModule,
    PolicyModule,
    ContentModule,
    BlogModule,
    CategoryModule,
    TagModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    VideoModule,
    ContactusModule,
    ExhibitionModule,
    WishlistModule,
    ProductModule,
    ProductcategoryModule,
    SubjectModule,
    SurfaceModule,
    CategoryModule,
    TagModule,
    MediaModule,TestimonialModule,MisModule,
    InventoryModule, OrdersModule,CartAdminModule,
    RouterModule.register([
      {
        path: 'admin', // Prefix for all child routes
        children: [
          { path: 'users', module: UsersModule },
          { path: 'roles', module: RolesModule },
          { path: 'permissions', module: PermissionsModule },
          { path: 'surfaces', module: SurfaceModule },
          { path: 'subjects', module: SubjectModule },
          { path: 'wishlists', module: WishlistModule },
          { path: 'videos', module: VideoModule },
          { path: 'shippings', module: ShippingModule },
          { path: 'styles', module: StyleModule },
          { path: 'products', module: ProductModule },
          { path: 'productcategory', module: ProductcategoryModule },
          { path: 'policies', module: PolicyModule },
          { path: 'mediums', module: MediumModule },
          { path: 'exhibitions', module: ExhibitionModule },
          { path: 'currencies', module: CurrencyModule },
          { path: 'contactus', module: ContactusModule },
          { path: 'blogs', module: BlogModule },
          { path: 'categories', module: CategoryModule },
          { path: 'tags', module: TagModule },
          { path: 'contents', module: ContentModule },
          { path: 'inventries', module: InventoryModule },
          { path: 'orders', module: OrdersModule},
          { path: 'carts', module: CartAdminModule},
           { path: 'testimonials', module: TestimonialModule},
            { path: 'mis', module: MisModule},
        ],
      },
    ]),
   
    
 
    


  ],
  providers: [
    //  { provide: APP_GUARD, useClass: JwtAuthGuard },
    //{ provide: APP_GUARD, useClass: RolesGuard },
    //{ provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: AdminCompositeGuard }// Combines JwtAuth + Roles + Permissions for admin only
  ],

})
export class AdminModule { }
