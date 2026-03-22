import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { BlogClientModule } from './blog/blog-client.module';
// import { ProductsModule } from './products/products.module';
// import { ExhibitionModule } from './exhibition/exhibition.module';
// import { CartModule } from './cart/cart.module';
// import { OrderModule } from './order/order.module';
// import { InventProductModule } from './invent-product/invent-product.module';
// //import { PaymentModule } from './payment/payment.module';
// import { ContentModule } from './content/content.module';
 
// import { ClientTestimonialModule } from './testimonial/client-testimonial.module';
// import { ContactUsClientModule } from './contact/contact-us-client.module';
// import { ClientVideoModule } from './video/video.module';


@Module({

  imports: [
    BlogClientModule,
    // ProductsModule,
    // ExhibitionModule,
    // InventProductModule,
    // CartModule,ClientTestimonialModule,
    // OrderModule,ContentModule,ContactUsClientModule,ClientVideoModule,
    RouterModule.register([
      {
        path: 'client', // Prefix for all child routes
        children: [
          { path: 'blogs', module: BlogClientModule },
          // { path: 'products', module: ProductsModule },
          // { path: 'exhibitions', module: ExhibitionModule },
          // { path: 'invent-product', module: InventProductModule },
          // { path: 'cart', module: CartModule },
          // { path: 'order', module: OrderModule },
          // { path: 'content', module: ContentModule }, 
          //  { path: 'testimonials', module: ClientTestimonialModule },
          //    { path:'contact-us', module: ContactUsClientModule },
          //      { path:'videos', module: ClientVideoModule },
        ],
      }, 
    ]),
    
   // PaymentModule,
 

  ],

})
export class ClientModule { }
