// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../../shared/entities/role.entity';
import { Permission } from '../../../shared/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
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

  async createRole(roleData: CreateRoleDto): Promise<Role> {
    const { permissionsIds, ...rest } = roleData;
    const role = this.roleRepository.create(rest);

    console.log('----1--permissoin id-----', permissionsIds);

    // Step 2: Load roles and assign
    if (permissionsIds?.length) {
      const roles = await this.permissionRepository.find({
        where: { id: In(permissionsIds) },
      });

      console.log('--2----permissoin id-----', roles);

      role.permissions = roles;
    }

    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
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

  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const permissions =
      await this.permissionRepository.findByIds(permissionIds);

    role.permissions = permissions;
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
