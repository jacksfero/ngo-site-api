import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from '../../../shared/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { CacheService } from 'src/core/cache/cache.service';


@Injectable()
export class SubjectService {
  constructor(
     private cacheService: CacheService,

    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto,user: any,): Promise<Subject> {
    try {
      const existingSubject = await this.subjectRepository.findOne({
        where: { subject: createSubjectDto.subject.trim() },
      });
  
      if (existingSubject) {
        throw new ConflictException('Subject already exists');
      }

      const subject = this.subjectRepository.create({
      ...createSubjectDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
  const saved = await this.subjectRepository.save(subject);

  // 🧹 Invalidate admin and frontend caches
  await this.cacheService.deletePattern('Admin:subjects:*');
  await this.cacheService.deletePattern('frontend:subjects:*');

  return saved;
    
    } catch (error) {
      throw new  error("Subject Noe save ")
    }
     
  }
  async getActiveList(): Promise<SubjectResponseDto[]> {
    const cacheKey = 'Admin:subjects:active';

     // ✅ 1. Try cache first
   const cached = await this.cacheService.get<SubjectResponseDto[]>(cacheKey);
  if (cached && cached.length) {
    return cached;
  } // ✅ 2. Fetch from DB if not cached
  const subjects = await this.subjectRepository.find({
    where: { status: true },
    order: { subject: 'ASC' },
  });

  const response = plainToInstance(SubjectResponseDto, subjects, {
    excludeExtraneousValues: true,
  });

  // ✅ 3. Cache result for 1 hour (3600 seconds)
  await this.cacheService.set(cacheKey, response, { ttl: 3600 });

  return response;
  }
  async findAll(): Promise<Subject[]> {
     const cacheKey = 'Admin:subjects:all';
   
  const cached = await this.cacheService.get<Subject[]>(cacheKey);
  if (cached && cached.length) {
    return cached;
  }
     
      // ✅ 2. Fetch from database if not cached
  const subjects = await this.subjectRepository.find({
    order: { id: 'DESC' },
  });

  // ✅ 3. Store in cache for 1 hour
  await this.cacheService.set(cacheKey, subjects, { ttl: 3600 });

  return subjects;
  }

 async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Surface ${id} not found`);
    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto, user: any): Promise<Subject> {
    if (dto.subject) {
      const existingSubject = await this.subjectRepository.findOne({
        where: {
          subject: dto.subject.trim(),
          id: Not(id), // Exclude current subject from check
        },
      });

      if (existingSubject) {
        throw new ConflictException('Subject already exists');
      }
    }
    const subject = await this.findOne(id);
    Object.assign(subject, dto);
    subject.updatedBy = user.sub.toString(); // or user.sub.toString()
      // 🧹 Invalidate caches
  await this.cacheService.deletePattern('Admin:subjects:*');
  await this.cacheService.deletePattern('Admin:subjects:*');
    return this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepository.remove(subject);
  }

  async toggleStatus(id: number, user: any): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`subject with ID ${id} not found`);
    }
    subject.status = !subject.status;
    subject.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.subjectRepository.save(subject);
  }
  async validateSubject(subject: string, excludeId?: number): Promise<boolean> {
    const where: any = { subject: subject.trim() };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    
    const existing = await this.subjectRepository.findOne({ where });
    return !existing;
  }


}

