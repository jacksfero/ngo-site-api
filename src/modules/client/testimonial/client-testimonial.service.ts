import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from 'src/shared/entities/testimonial.entity';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class ClientTestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
    private readonly cacheService: CacheService,
  ) {}

  private readonly CACHE_KEY = 'frontend:testimonials:approved';

  async findAll(): Promise<Testimonial[]> {
    // ✅ Try to read from cache
    const cached = await this.cacheService.get<Testimonial[]>(this.CACHE_KEY);
    if (cached) return cached;

    // ✅ Fetch from DB (only approved testimonials)
    const testimonials = await this.testimonialRepo.find({
      where: { status: 'approved' },
      order: { createdAt: 'DESC' },
      take: 20, // limit for frontend display
    });

    // ✅ Store in cache for 5 minutes (optional TTL)
    await this.cacheService.set(this.CACHE_KEY, testimonials);

    return testimonials;
  }

  async findById(id: number): Promise<Testimonial | null> {
    const key = `frontend:testimonial:${id}`;
    const cached = await this.cacheService.get<Testimonial>(key);
    if (cached) return cached;

    const testimonial = await this.testimonialRepo.findOne({
      where: { id, status: 'approved' },
    });

    if (testimonial) await this.cacheService.set(key, testimonial);

    return testimonial;
  }
}
