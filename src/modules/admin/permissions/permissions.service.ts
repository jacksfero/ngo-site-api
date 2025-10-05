// src/permissions/permissions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../../../shared/entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CacheService } from 'src/core/cache/cache.service';
import { Role } from '../../../shared/entities/role.entity';

@Injectable()
export class PermissionsService {
   private readonly CACHE_NAMESPACE = 'permission_listing';
  constructor(

    private cacheService: CacheService,
    
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

    const cacheKey = 'permissions:all';
     // 1. Check cache
  const cached = await this.cacheService.get<Permission[]>(cacheKey);
  if (cached) {
    return cached;
  }
 // 2. Query DB
  const permissions = await this.permissionRepository.find();

   // 3. Save to cache for 5 minutes
  await this.cacheService.set(cacheKey, permissions, { ttl: 600 });
  return permissions;

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
