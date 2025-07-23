import { Module } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { ExhibitionController } from './exhibition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';
import { ExhibitionProduct } from 'src/shared/entities/exhibition-product.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Exhibition,ExhibitionProduct])],
  controllers: [ExhibitionController],
  providers: [ExhibitionService],
})
export class ExhibitionModule {}
