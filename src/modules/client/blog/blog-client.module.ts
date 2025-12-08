import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/shared/entities/blog.entity';
import { BlogClientController } from './blog-client.controller';
import { BlogClientService } from './blog-client.service';
import { Category } from 'src/shared/entities/category.entity';
import { BlogView } from 'src/shared/entities/blog-view.entity';
import { BlogLike } from 'src/shared/entities/blog-like.entity';


@Module({

    imports: [
        TypeOrmModule.forFeature([Blog,Category,BlogView,BlogLike])
    ],
    controllers: [BlogClientController],
    providers: [BlogClientService],
})
export class BlogClientModule { }
