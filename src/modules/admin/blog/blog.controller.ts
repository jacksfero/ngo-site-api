import {
  Controller, Req,
  Get,
  Post,
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
  }*/

 
  @Post()
  @UseInterceptors(FileInterceptor('titleImage', blogImageStorage))
  create(
    @Body() dto: CreateBlogDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogService.create(dto, req.user, file?.filename);
  }
 

@Post()
createaaaa(@Body() createBlogDto: CreateBlogDto, @Req() req) {
  return this.blogService.create(createBlogDto, req.user);
}


@Get()
findAllss() {
  return this.blogService.findAll();
}
@Get()
async findAll() {
  const blogs = await this.blogService.findAll();
  //  return plainToInstance(Blog, blogs, { groups: ['admin'] }); // 👈 Apply admin group
  return blogs;

  // return this.blogService.findAll(); // Automatic serialization
}

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.blogService.findOne(id);
}

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateBlogDto,
) {
  return this.blogService.update(id, dto);
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
