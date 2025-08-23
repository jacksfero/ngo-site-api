import { Module } from '@nestjs/common';
 
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionType } from '../entities/commission-type.entity';
import { CommissionTypeService } from './commision-type.service';
import { CommissionTypeController } from './commision-type.controller';

@Module({
  imports:[TypeOrmModule.forFeature([CommissionType])],
  controllers: [CommissionTypeController],
  providers: [CommissionTypeService],
  exports:[CommissionTypeService]
})
export class CommisionTypeModule {}
