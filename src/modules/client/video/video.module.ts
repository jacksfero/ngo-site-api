import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
 
import { ClientVideoController } from './video.controller';
import { ClientVideoService } from './video.service';
 
import { Video } from 'src/shared/entities/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  providers: [ClientVideoService],
  controllers: [ClientVideoController],
})
export class ClientVideoModule {

    constructor(

         
    ){console.log('vvvvvvvvvvvvvvvvv----------------------');}
}
