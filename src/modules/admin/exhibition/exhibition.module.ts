import { Module } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { ExhibitionController } from './exhibition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exhibition } from 'src/shared/entities/exhibition.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Exhibition])],
  controllers: [ExhibitionController],
  providers: [ExhibitionService],
})
export class ExhibitionModule {}
