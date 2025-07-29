import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { BlogClientModule } from './blog/blog-client.module';
import { ProductsModule } from './products/products.module';
import { ExhibitionModule } from './exhibition/exhibition.module';


@Module({

  imports: [
    BlogClientModule,
    ProductsModule,
    ExhibitionModule,

    RouterModule.register([
      {
        path: 'client', // Prefix for all child routes
        children: [
          { path: 'blogs', module: BlogClientModule },
          { path: 'products', module: ProductsModule },
          { path: 'exhibitions', module: ExhibitionModule },
        ],
      },
    ]),
 


  ],

})
export class ClientModule { }
