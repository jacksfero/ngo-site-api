import { Module } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { ExhibitionController } from './exhibition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { Currency } from 'src/shared/entities/currency.entity';
import { ExhibitionPageView } from 'src/shared/entities/exhibition-view.entity';
import { ExhibitionPageLike } from 'src/shared/entities/exhibition-like.entity';

@Module({
   imports:[TypeOrmModule.forFeature([Exhibition,Currency,ExhibitionPageView,ExhibitionPageLike])],
  controllers: [ExhibitionController],
  providers: [ExhibitionService],
})
export class ExhibitionModule {}
