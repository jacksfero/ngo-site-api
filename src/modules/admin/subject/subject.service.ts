import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from '../../../shared/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SubjectResponseDto } from './dto/subject-response.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) { }

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
    return this.subjectRepository.save(subject);
    } catch (error) {
      throw new  error("Subject Noe save ")
    }
     
  }
  async getActiveList(): Promise<SubjectResponseDto[]> {
    const surfaces = await this.subjectRepository.find({
      order: { subject: 'ASC' },
       where: {
        status: true, // only active surfaces
      }
    });
    return plainToInstance(SubjectResponseDto, surfaces, {
      excludeExtraneousValues: true,
    });
  }
  async findAll(): Promise<Subject[]> {
   return this.subjectRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      
    });
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

