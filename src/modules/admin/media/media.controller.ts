import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  Param,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // @Post('uploads')
  // @UseInterceptors(FileInterceptor('file'))
  // async upload(@UploadedFile() file: Express.Multer.File) {
  //   const url = await this.mediaService.uploadFile(file, 'uploads');
  //   return { url };
  // }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    console.log('--------file--------',file);
    return this.mediaService.uploadFile(file, 'products');
  }


  @Get('list')
   async list(@Query('folder') folder?: string) {
      const files = await this.mediaService.listFiles(folder || '');
     return { files };
   }

  // @Delete(':key')
  // async delete(@Param('key') key: string) {
  //   await this.mediaService.deleteFile(key);
  //   return { message: 'File deleted successfully' };
  // }
}
