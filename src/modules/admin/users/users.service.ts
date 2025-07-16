// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { roleIds, ...rest } = dto;
    // Step 1: Create the user entity
    const user = this.userRepository.create(rest); // sets username, password

    // Step 2: Load roles and assign
    if (roleIds?.length) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      user.roles = roles;
    }

    // Step 3: Save user
    return await this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'], // Include roles if you need them in JWT
    });

    return user ?? undefined;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async assignRolesToUser(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const roles = await this.roleRepository.findByIds(roleIds);
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async getUserWithRoles(userId: number): Promise<User> {
    const User = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!User) {
      throw new NotFoundException(`Permission '${userId}' not found`);
    }
    return User;
  }
}
