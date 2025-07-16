import { Module } from '@nestjs/common';
import { MediumService } from './medium.service';
import { MediumController } from './medium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medium } from '../../../shared/entities/medium.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Medium])],
  controllers: [MediumController],
  providers: [MediumService],
})
export class MediumModule {}
