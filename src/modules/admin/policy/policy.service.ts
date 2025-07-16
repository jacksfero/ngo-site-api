import { Injectable } from '@nestjs/common';
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

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const result = await this.policyRepository.save(createPolicyDto);

    return result;
  }

  async findAll(): Promise<Policy[]> {
    const result = await this.policyRepository.find();
    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} policy`;
  }

  update(id: number, updatePolicyDto: UpdatePolicyDto) {
    return `This action updates a #${id} policy`;
  }

  remove(id: number) {
    return `This action removes a #${id} policy`;
  }
}
