import {
  Controller,
  Get,
  Post,
  Body, Req,
  Patch,
  Param, Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUsersAboutDto } from './dto/create-users-about.dto';
import { UpdateUsersAboutDto } from './dto/update-users-about.dto';
import path from 'path';

@Controller()
//@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  //@RequirePermissions('create_user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }


  @Get('by-role/:roleName')
  async getUsersByRole(@Param('roleName') roleName: string) {
    const users = await this.usersService.findUsersByRole(roleName);
    return users;
  }

  /** Start User about us section */
  @Post('about/:userId')
  createUserAbout(@Param('userId', ParseIntPipe) userId: number, @Body() dto: CreateUsersAboutDto, @Req() req) {
    return this.usersService.createUserAbout(dto, userId, req.user);
  }

  @Get('about/:userId')
  findOneUserAbout(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOneAboutByUserId(userId);
  }

  @Patch('about/:id')
  updateUserAbout(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsersAboutDto) {
    return this.usersService.updateUserAbout(id, dto);
  }

  @Delete('about/:id')
  removeUserAbout(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUserAbout(id);
  }

  /** End User about us section */
  @Get(':id')
  //@RequirePermissions('read_user')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }



  @Post(':id/roles')
  assignRoles(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.assignRolesToUser(+id, dto);
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
