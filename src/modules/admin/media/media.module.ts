import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
 
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { Media } from 'src/shared/entities/media.entity';
import { S3Service } from 'src/shared/s3/s3.service';

@Module({
 // imports: [TypeOrmModule.forFeature([Media]), ConfigModule],
 imports: [ ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, S3Service],
  exports: [MediaService],
})
export class MediaModule {}


