import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { BlogClientModule } from './blog/blog-client.module';


@Module({

  imports: [
    BlogClientModule,


    RouterModule.register([
      {
        path: 'client', // Prefix for all child routes
        children: [
          { path: 'blogs', module: BlogClientModule },
          //  { path: 'blogs', module: BlogClientModule },

        ],
      },
    ]),


  ],

})
export class ClientModule { }
