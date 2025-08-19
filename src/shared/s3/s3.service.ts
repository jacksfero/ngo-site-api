import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client,ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
 

@Injectable()
export class S3Service {
  private client: S3Client;
 // private s3: s3;
 private readonly bucket: string;
  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_BUCKET_NAME')??'';
     
// const bucket = process.env.AWS_BUCKET_NAME;//'indigalleria-images');
 //console.log('-----bucketnameaa==-----------',bucket);
     if (!this.bucket) {
        throw new InternalServerErrorException('AWS_BUCKET_NAME is not configured');
     }
    
    this.client = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'ap-south-1'), // default if missing
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey:this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType?: string) {

   const sss = this.config.get<string>('AWS_BUCKET_NAME');

  //  console.log('-----bucketname==-----------',this.bucket,'-----====-----',sss);
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
   //   ACL: 'public-read', // adjust if you use signed URLs / private buckets
    });
    await this.client.send(cmd);
    return key;
  }

  async deleteObject(key: string) {
    const cmd = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
    await this.client.send(cmd);
  }

    /**
   * List objects inside a bucket, optionally with a prefix (folder).
   */
    async listObjects(prefix?: string) {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });
  
      const response = await this.client.send(command);
      // return response.Contents?.map((item) => ({
      //   key: item.Key,
      //   lastModified: item.LastModified,
      //   size: item.Size,
      // })) ?? [];

      return (response.Contents ?? [])
  .filter((item) => !!item.Key)
  .map((item) => ({
    key: item.Key as string,
    lastModified: item.LastModified,
    size: item.Size,
  }));
    }
  
    /**
     * Generate a signed URL for a file in S3.
     * @param key The object key in the bucket
     * @param expiresInSeconds Expiration time in seconds
     */
    async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
  
      return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    }
  // optionally, you can add presign functionality if you want client-side direct upload
}
/*****************
 * 
 * 
 * 
 * 
 * 
 npm install sharp
 * 
 * 


import * as sharp from 'sharp';

async uploadFileWithThumbnail(file: Express.Multer.File, key: string) {
  // 1. Upload original
  await this.s3.upload({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }).promise();

  const originalUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  // 2. Generate thumbnail (e.g. 300px width)
  const thumbnailBuffer = await sharp(file.buffer)
    .resize({ width: 300 })
    .toBuffer();

  const thumbKey = key.replace(/(\.[\w\d_-]+)$/i, '_thumb$1');

  await this.s3.upload({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: thumbKey,
    Body: thumbnailBuffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }).promise();

  const thumbnailUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;

  return { originalUrl, thumbnailUrl };
}








import { Controller, Get, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async getGallery(@Query('folder') folder: string = 'editor-images/') {
    return this.galleryService.listImages(folder);
  }
}

// gallery.service.ts
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class GalleryService {
  private s3 = new S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async listImages(folder: string) {
    const result = await this.s3
      .listObjectsV2({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: folder, // e.g. "editor-images/"
      })
      .promise();

    return result.Contents?.map(
      (item) =>
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    );
  }
}

GET /gallery?folder=editor-images/
 */