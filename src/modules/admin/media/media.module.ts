import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { S3Service } from './s3.client';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { Media } from 'src/shared/entities/media.entity';

@Module({
 // imports: [TypeOrmModule.forFeature([Media]), ConfigModule],
 imports: [ ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, S3Service],
  exports: [MediaService],
})
export class MediaModule {}


