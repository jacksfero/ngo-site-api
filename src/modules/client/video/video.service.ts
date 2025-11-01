import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from 'src/shared/entities/video.entity';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class ClientVideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,

    private readonly cacheService: CacheService,
  ) {}

  ;

  async findAll(userId: number): Promise<Video[]> {
  const cacheKey = `frontend:Video:${userId}`;
  const cached = await this.cacheService.get<Video[]>(cacheKey);
   if (cached) return cached;

  const videos = await this.videoRepo
    .createQueryBuilder('video')
    .leftJoinAndSelect('video.user', 'user')
    .where('video.status = :status', { status: true })
    .andWhere('user.id = :userId', { userId })
    .select([
      'video.id',
      'video.videoUrl',
      'user.username','user.id',
    ])
    .orderBy('video.id', 'DESC')
    .take(20)
    .getMany();

  if (!videos.length) {
    throw new NotFoundException(`No videos found for user ID: ${userId}`);
  }

  await this.cacheService.set(cacheKey, videos); // cache 5 minutes

  return videos;
}

//   async findById(id: number): Promise<Video | null> {
//     const key = `frontend:testimonial:${id}`;
//     const cached = await this.cacheService.get<Video>(key);
//     if (cached) return cached;

//     const testimonial = await this.videoRepo.findOne({
//       where: { id, status: 'approved' },
//     });

//     if (testimonial) await this.cacheService.set(key, testimonial);

//     return testimonial;
//   }
}
