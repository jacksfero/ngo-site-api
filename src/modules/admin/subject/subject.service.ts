import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from '../../../shared/entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) { }

  async create(createSubjectDto: CreateSubjectDto,user: any,): Promise<Subject> {
    try {
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

  async findAll(): Promise<Subject[]> {
   return this.subjectRepository.find({
      order: {
        createdAt: 'DESC', // sort by newest first
      },
      /* where: {
        status: true, // only active surfaces
      },*/
    });
  }

 async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Surface ${id} not found`);
    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto, user: any): Promise<Subject> {
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



}

