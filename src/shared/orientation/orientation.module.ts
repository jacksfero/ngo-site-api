import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrientationService } from './orientation.service';
import { OrientationController } from './orientation.controller';
import { Orientation } from '../entities/orientation.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Orientation])],
  controllers: [OrientationController],
  providers: [OrientationService],
  exports:[OrientationService]
})
export class OrientationModule {}
