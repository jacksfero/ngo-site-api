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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller()
//@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 @Roles('Admin','Super Admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
 
  @Post()
  @RequirePermissions('create_permission')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  @RequirePermissions('read_permission')
  findAll() {
    return this.permissionsService.findAllPermissions();
  }

  @Get(':id')
 @RequirePermissions('read_permission')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findPermissionById(+id);
  }

  @Patch(':id')
  @RequirePermissions('update_permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(+id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_permission')
  remove(@Param('id') id: string) {
    return this.permissionsService.deletePermission(+id);
  }
}
