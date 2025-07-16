// src/permissions/permissions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../../../shared/entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
//import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Role } from '../../../shared/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createPermission(
    permissionData: CreatePermissionDto,
  ): Promise<Permission> {
    const { roleIds, ...rest } = permissionData;

    const permission = this.permissionRepository.create(permissionData);

   /* if (roleIds?.length) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });

      if (!roles.length) {
        throw new Error('----No roles found for given IDs');
      }

      console.log(roleIds,'------------Loaded roles:', roles);

      permission.roles = roleIds;
    }*/

    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    // const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException(`Permission '${id}' not found`);
    }
    return permission;
  }

  async updatePermission(
    id: number,
    updateData: Partial<Permission>,
  ): Promise<Permission> {
    await this.permissionRepository.update(id, updateData);
    return this.findPermissionById(id);
  }

  async deletePermission(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
