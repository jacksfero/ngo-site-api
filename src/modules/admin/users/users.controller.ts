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
  Query,
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
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from '../product/dto/product.dto';
import { UsersListDto } from './dto/users-list.dto';

@Controller()
//@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
 // @Permissions('create_user') // Custom decorator (optional)
 // @RequirePermissions('create_user') // ✅ Good for RBAC, uncomment if needed
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user);
  }
  

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<UsersListDto>> {
    return this.usersService.findAll(paginationDto);
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

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }

  @Post(':id/roles')
  assignRoles(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.assignRolesToUser(+id, dto);
  }

  


  @Patch(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
  return this.usersService.update(id, dto);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }



}
