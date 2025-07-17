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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

//@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
//@Roles('admin')
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  //@RequirePermissions('create_roles')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  // @RequirePermissions('manage_roles')
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findRoleById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
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
  assignPermissionToRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.assignPermissionsToRole(+id, updateRoleDto);
  }
}
