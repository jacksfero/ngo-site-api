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
import { S3Service } from 'src/shared/s3/s3.service';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,

  ) {}
 
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


   @Post('editor-image')
   @UseInterceptors(FileInterceptor('file'))
   async uploadEditorImage(
    @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File) 
    {
     //const key = `editor/${Date.now()}-${file.originalname}`;

     const cleanName = sanitizeFileName(file.originalname);
     const key = `editor/${Date.now()}-${cleanName}`;
    // console.log('file----',cleanName,'---path------',key);
    const url =
   await this.s3Service.uploadBuffer(key, file.buffer, file.mimetype); 

  return { url }; // return URL to editor
   }

  // @Delete(':key')
  // async delete(@Param('key') key: string) {
  //   await this.mediaService.deleteFile(key);
  //   return { message: 'File deleted successfully' };
  // }
}
