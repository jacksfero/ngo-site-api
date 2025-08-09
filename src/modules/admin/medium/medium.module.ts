import {   Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { MediumService } from './medium.service';
import { MediumController } from './medium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medium } from '../../../shared/entities/medium.entity';

@Module({
   imports: [
    CacheModule.register({
      ttl: 300, // cache for 5 minutes
      max: 100, // maximum number of items in cache
      isGlobal: true, // make it global
    }),
    TypeOrmModule.forFeature([Medium])],
  controllers: [MediumController],
  providers: [MediumService],
})
export class MediumModule {}
