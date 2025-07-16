import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from '../../../shared/entities/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [PolicyController],
  providers: [PolicyService],
})
export class PolicyModule {}
