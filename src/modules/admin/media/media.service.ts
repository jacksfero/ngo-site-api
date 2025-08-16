import { Injectable, BadRequestException } from '@nestjs/common';
  import { UploadedFileResponse } from './interfaces/upload-file-response.interface';
import { S3Service } from 'src/shared/s3/s3.service';
 

 
  
  
@Injectable()
export class MediaService {
   
  constructor(private readonly s3Service: S3Service) {}


  async uploadFile(file: Express.Multer.File, folder = 'uploads'):Promise<UploadedFileResponse>  {
     if (!file) throw new BadRequestException('File is required');
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    await this.s3Service.uploadBuffer(key, file.buffer, file.mimetype);
    return { key, url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}` };
 
  }
  async delete(key: string): Promise<void> {
    await this.s3Service.deleteObject(key);
  }
  
  async listFiles(prefix = 'uploads'): Promise<UploadedFileResponse[]> {
    const objects = await this.s3Service.listObjects(prefix);
  
    return objects.map((item) => ({
      key: item.key, // lowercase because S3Service returns "key"
      url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${item.key}`,
    }));
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.s3Service.getSignedUrl(key, expiresInSeconds);
  } 
}
