import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
 
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller()
 //@Roles('Admin','Super Admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
 // @RequirePermissions('create_roles')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
   @RequirePermissions('read_roles')
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @RequirePermissions('read_roles')
  findOne(@Param('id') id: string) {
    return this.rolesService.findRoleById(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_roles')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_roles')
  remove(@Param('id') id: string) {
    return this.rolesService.deleteRole(+id);
  }

  // @Post(':roleId/permissions')
  // assignPermissionToRole(
  //   @Param('id') id: string,
  //   @Body() updateRoleDto: UpdateRoleDto,
  // ) {
  //   return this.rolesService.assignPermissionsToRole(+id, updateRoleDto);
  // }

  @Post(':id/permissions')
  @RequirePermissions('manage_roles')
  assignPermissionToRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.assignPermissionsToRole(+id, updateRoleDto);
  }
}
