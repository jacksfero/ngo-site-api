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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';

@Controller('users')
//@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  //@RequirePermissions('create_user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read_user')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post(':id/roles')
  @RequirePermissions('assign_roles')
  async assignRoles(@Param('id') userId: string, @Body() roleIds: number[]) {
    return this.usersService.assignRolesToUser(+userId, roleIds);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
