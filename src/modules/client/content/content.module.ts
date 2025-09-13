import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from 'src/shared/entities/currency.entity';
import { Policy } from 'src/shared/entities/policy.entity';
import { Content } from 'src/shared/entities/content.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Currency,Policy,Content,])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
