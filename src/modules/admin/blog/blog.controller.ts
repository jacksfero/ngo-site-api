import {
  Controller, Req,
  Get,
  Post,Query,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFile,

  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
 
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { blogImageStorage } from './utils/blog-image-upload';
 
import { Blog } from 'src/shared/entities/blog.entity';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { BLOG_LIMIT, BLOG_MAX_LIMIT, BLOG_PAGE, USERS_PAGE } from 'src/shared/config/pagination.config';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { BlogPaginationDto } from './dto/blog-pagination.dto';
import { BlogListDto } from './dto/blog-list.dto';



@Controller()
@UseInterceptors(ClassSerializerInterceptor) // 👈 Required for @Expose
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

 /* @Post('create')
  @UseInterceptors(
    FileInterceptor('titleImage', {
      storage: diskStorage({
        destination: './uploads/blog-images',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async createBlog(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateBlogDto,
    @Req() req: any,
  ) {
    const user = req.user;
    const imagePath = file?.filename;

    return this.blogService.create(dto, user, imagePath);
  }@Post()
  @UseInterceptors(FileInterceptor('titleImage', blogImageStorage))
  create(
    @Body() dto: CreateBlogDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogService.create(dto, req.user, file?.filename);
  }*/

 
  @Post()
  //@UseInterceptors(FileInterceptor('titleImage'))
  @UseInterceptors(FileInterceptor('titleImage'))
  create(
    @Body() dto: CreateBlogDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogService.create(dto, req.user, file ?? null);
  }
   /*
@Get()
async findAll() {
  const blogs = await this.blogService.findAll();
  //  return plainToInstance(Blog, blogs, { groups: ['admin'] }); // 👈 Apply admin group
  return blogs; 
}
*/
@Get()
async findAll(
  @Query(new PaginationPipe(BLOG_LIMIT, BLOG_MAX_LIMIT, BLOG_PAGE))
  paginationDto: BlogPaginationDto
): Promise<PaginationResponseDto<BlogListDto>> {
  return this.blogService.findAll(paginationDto);
}

 

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.blogService.findOne(id);
}
 
@Patch(':id')
//@UseInterceptors(FileInterceptor('titleImage', blogImageStorage))
@UseInterceptors(FileInterceptor('titleImage'))
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateBlogDto,
  @UploadedFile() file?: Express.Multer.File
) {
  return this.blogService.update(id, dto, file ?? null );
}

@Patch(':id/publish')
publish(@Param('id') id: string) {
  return this.blogService.publish(+id);
}



@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.blogService.remove(id);
}
}
