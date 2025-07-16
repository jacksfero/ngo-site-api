import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurfaceService } from './surface.service';
import { SurfaceController } from './surface.controller';
import { Surface } from '../../../shared/entities/surface.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Surface])],
  controllers: [SurfaceController],
  providers: [SurfaceService],
})
export class SurfaceModule {}
