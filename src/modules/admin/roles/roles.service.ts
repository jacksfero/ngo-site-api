// src/roles/roles.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../../shared/entities/role.entity';
import { Permission } from '../../../shared/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CacheService } from 'src/core/cache/cache.service';
import { response } from 'express';

@Injectable()
export class RolesService {
  constructor(
     private cacheService: CacheService,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

async createRole(dto: CreateRoleDto, siteId: number): Promise<Role> {
  const { permissionsIds, ...rest } = dto;


  const existing = await this.roleRepository.findOne({
  where: {
    name: rest.name.trim().toLowerCase(),
    site: { id: siteId },
  },
});

if (existing) {
  throw new BadRequestException('Role already exists for this site');
}

  const role = this.roleRepository.create({
    ...rest,
    name: rest.name.trim().toLowerCase(),
    site: { id: siteId },
  });

  if (permissionsIds?.length) {
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionsIds) },
    });

    if (permissions.length !== permissionsIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    role.permissions = permissions;
  }

  return this.roleRepository.save(role);
}

  async findAllRoles(siteId: number): Promise<Role[]> {
     const cacheKey = 'Admin:roles:siteId';
       
      const cached = await this.cacheService.get<Role[]>(cacheKey);
      if (cached && cached.length) {
        return cached;
      }
   const response = await this.roleRepository.find({
      where: {   site: { id: siteId }, },
    relations: ['permissions'],order: {
      id: 'DESC', // sort by newest first
    },
   });
    await this.cacheService.set(cacheKey, response, { ttl: 93600 });
    return response;
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateRole(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    //  const role =     await this.roleRepository.update(id, updateData);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    // Update name/description if provided
    if (dto.name) role.name = dto.name;
    if (dto.description) role.description = dto.description;

    if (dto.permissionsIds?.length) {
      const permissions = await this.permissionRepository.findBy({
        id: In(dto.permissionsIds),
      });

      role.permissions = permissions; // replaces old list
    }

    // return this.findRoleById(id);
    return this.roleRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignPermissionsToRole_backup(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);

    const permissions =
      await this.permissionRepository.findByIds(permissionIds);

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  // id: number, dto: UpdateRoleDto permissionIds: number[],

  async assignPermissionsToRole(
    roleId: number,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    // 1. Find the role
    const role = await this.findRoleById(roleId);
    // const permissions =
    //   await this.permissionRepository.findByIds(permissionIds);
    // 2. Find the new permissions
    if (dto.permissionsIds?.length) {
      const permissions = await this.permissionRepository.findBy({
        id: In(dto.permissionsIds),
      });

      // 3. Update the role's permissions
      role.permissions = permissions;
      return this.roleRepository.save(role);
    }
    // 4. If no permissions provided, clear existing ones
    role.permissions = [];
    return this.roleRepository.save(role);
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);
    role.permissions = role.permissions.filter(
      (permission) => permission.id !== permissionId,
    );
    return this.roleRepository.save(role);
  }
}
