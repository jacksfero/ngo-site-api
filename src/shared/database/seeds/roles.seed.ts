// src/database/seeds/roles.seed.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from 'src/modules/admin/roles/roles.service';
import { PermissionsService } from 'src/modules/admin/permissions/permissions.service';

@Injectable()
export class RolesSeed implements OnModuleInit {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onModuleInit() {
  //  await this.seedPermissions();
   // await this.seedRoles();
  }

  private async seedPermissions() {
    const permissions = [
      {
        name: 'create_user',
        resource: 'user',
        action: 'create',
        description: 'Create new users',
      },
      {
        name: 'read_user',
        resource: 'user',
        action: 'read',
        description: 'View user information',
      },
      {
        name: 'update_user',
        resource: 'user',
        action: 'update',
        description: 'Modify user data',
      },
      {
        name: 'delete_user',
        resource: 'user',
        action: 'delete',
        description: 'Remove users',
      },
      {
        name: 'assign_roles',
        resource: 'role',
        action: 'assign',
        description: 'Assign roles to users',
      },
    ];

    for (const permission of permissions) {
      await this.permissionsService.createPermission(permission);
    }
  }

  private async seedRoles() {
   /* const allPermissions = await this.permissionsService.findAllPermissions();
    const adminPermissions = allPermissions.map((p) => p.id);

    await this.rolesService.createRole({
      name: 'admin',
      description: 'Administrator with full access',
    });

    const adminRole = await this.rolesService.findRoleById(1);
    await this.rolesService.assignPermissionsToRole(
      adminRole.id,
      adminPermissions,
    );

    await this.rolesService.createRole({
      name: 'user',
      description: 'Regular user with basic permissions',
    });*/
  }
}
