import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from 'src/shared/entities/blog.entity';
import { plainToInstance } from 'class-transformer';
//import { ClassSerializerInterceptor } from '@nestjs/common';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // 👈 Required for @Expose
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @Get()
  findAllss() {
    return this.blogService.findAll();
  }
  @Get()
  async findAll() {
    const blogs = await this.blogService.findAll();
    //  return plainToInstance(Blog, blogs, { groups: ['admin'] }); // 👈 Apply admin group
    return plainToInstance(Blog, blogs, {
      groups: ['admin'],
      excludeExtraneousValues: true, // 👈 Recommended: removes non-decorated properties
    });

    // return this.blogService.findAll(); // Automatic serialization
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.blogService.publish(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
