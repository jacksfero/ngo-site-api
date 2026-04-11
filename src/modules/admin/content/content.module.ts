import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
 
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentPage } from 'src/shared/entities/content-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentPage])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
