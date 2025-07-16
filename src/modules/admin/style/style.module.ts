import { Module } from '@nestjs/common';
import { StyleService } from './style.service';
import { StyleController } from './style.controller';
import { Style } from '../../../shared/entities/style.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Style])],
  controllers: [StyleController],
  providers: [StyleService],
})
export class StyleModule {}
