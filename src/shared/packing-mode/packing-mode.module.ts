import { Module } from '@nestjs/common';
import { PackingModeService } from './packing-mode.service';
import { PackingModeController } from './packing-mode.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
 
import { PackingModeEntity } from '../entities/packing-mode.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PackingModeEntity])],
  controllers: [PackingModeController],
  providers: [PackingModeService],
})
export class PackingModeModule {}
