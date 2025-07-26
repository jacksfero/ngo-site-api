import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from 'src/shared/entities/video.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private videoRepo: Repository<Video>,
  ) {}

 create(dto: CreateVideoDto,user:any) {
  const video = this.videoRepo.create({
    ...dto,
    user: { id: dto.user_id }, // ✅ associate user
   createdBy: user.sub.toString(), //userid
  });
  return this.videoRepo.save(video);
}

async findAll():Promise<Video[]> {
  return this.videoRepo.find({
    relations: ['user'], // only needed if `eager: false` in entity
  });
}
 async findOne(id: number):Promise<Video> {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException(`video ${id} not found`);
    return video;
  }
 async update(id: number, dto: UpdateVideoDto, user: any): Promise<Video> {
    const video = await this.findOne(id);
     if (!video) throw new NotFoundException(`video ${id} not found`);
     Object.assign(video, dto);
    if (dto.user_id) {
    video.user = { id: dto.user_id } as any; // or use await this.userRepo.findOne({ where: { id: dto.user_id } });
  }
    video.updatedBy = user.sub.toString(); // or user.sub.toString()
    return this.videoRepo.save(video);
  }

 

async remove(id: number): Promise<Video> {
  const record = await this.videoRepo.findOne({ where: { id } });

  if (!record) {
    throw new NotFoundException(`Video with ID ${id} not found`);
  }

  return this.videoRepo.remove(record);
}

}
