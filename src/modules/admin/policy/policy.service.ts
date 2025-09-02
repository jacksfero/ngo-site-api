import { Injectable,NotFoundException } from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from '../../../shared/entities/policy.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto,user:any): Promise<Policy> {
    const policy = this.policyRepository.create({
      ...createPolicyDto,
      // createdBy: user.username, // or user.sub (ID), depending on your use case
      createdBy: user.sub.toString(), //userid
    });
    return this.policyRepository.save(policy);
  }

  async findAll(): Promise<Policy[]> {
    const result = await this.policyRepository.find({
      order: {
        id: 'DESC', // sort by newest first
      },

    });    
    return result;
  }

 async findOne(id: number): Promise<Policy> {
      const policy = await this.policyRepository.findOne({ where: { id } });
     if (!policy) throw new NotFoundException(`policy ${id} not found`);
     return policy;
  }

 async update(id: number, updatePolicyDto: UpdatePolicyDto,user:any): Promise<Policy> {
      const policy = await this.findOne(id);
    Object.assign(policy,updatePolicyDto);
    policy.updatedBy = user.sub.toString();
    return this.policyRepository.save(policy);
  }

async remove(id: number): Promise<void> {
    const policy = await this.findOne(id);
    await this.policyRepository.remove(policy);
  }

  
  async toggleStatus(id: number, user: any): Promise<Policy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`policy   with ID ${id} not found`);
    }
    policy.status = !policy.status;
    policy.updatedBy = user.sub.toString(); // or user.sub.toString()

    return this.policyRepository.save(policy);
  }
}
