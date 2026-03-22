import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/shared/entities/blog.entity';
import { Category } from 'src/shared/entities/category.entity';
import { Tag } from 'src/shared/entities/tag.entity';
import { User } from 'src/shared/entities/user.entity';
import { NgoSite } from 'src/shared/entities/ngo-site.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Blog, Category, Tag, User,NgoSite])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
