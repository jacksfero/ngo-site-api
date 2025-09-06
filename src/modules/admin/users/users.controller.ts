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
  ParseEnumPipe,
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

import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

import { UsersListDto } from './dto/users-list.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';

import { USERS_LIMIT, USERS_MAX_LIMIT, USERS_PAGE } from 'src/shared/config/pagination.config';
import { CreateUserAddressDto } from 'src/modules/auth/dto/create-user-address.dto';
import { UpdateUserAddressDto } from 'src/modules/auth/dto/update-user-address.dto';
import { CreateBankDetailDto } from './dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from './dto/update-user-bank-detail.dto';
import { CreateKycDetailDto, UpdateKycDetailDto } from './dto/create-user-kyc-detail.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { AddressType } from 'src/shared/entities/users-address.entity';

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
    @Query(new PaginationClinetPipe(USERS_LIMIT, USERS_MAX_LIMIT, USERS_PAGE))
    paginationDto: UserPaginationDto
  ): Promise<PaginationResponseDto<UsersListDto>> {
    return this.usersService.findAll(paginationDto);
  }

  /* @Get()
   async findAll(
     @Query() paginationDto: UserPaginationDto,
   ): Promise<PaginationResponseDto<UsersListDto>> {
     return this.usersService.findAll(paginationDto);
   }
 */
  @Get('by-role/:roleName')
  async getUsersByRole(
    @Param('roleName') roleName: string,
    @Query('featured_artist') featured_artist?: boolean,

  ) {
    const users = await this.usersService.findUsersByRole(
      roleName,
      featured_artist??undefined  

    );
    return users;
  }

  @Get('artisttypelist')
  GetArtistTypeList() {
    return this.usersService.GetArtistTypeList();
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

  @Post('user-address/:id')
  createAddress(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUserAddressDto, @Req() req) {
    return this.usersService.createAddress(dto, id, req.user);
  }

  @Get('user-address/:id/:addressType')
  findAllAddress(
    @Param('id', ParseIntPipe) id: number,
    @Param('addressType', new ParseEnumPipe(AddressType)) addressType: AddressType,
  ) {
    return this.usersService.findAllForUserAddress(id,addressType);
  }

  @Patch('user-address/:id')
  updateAddress(@Param('id') id: number, @Body() dto: UpdateUserAddressDto, @Req() req) {
    return this.usersService.updateAddress(id, dto, req.user);
  }


  @Post('user-bank/:id')
  createBankDetail(@Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBankDetailDto,
    @Req() req
  ) {
    return this.usersService.createBankDetail(id, dto, req.user);
  }

  @Get('user-bank/:id')
  findOneBankDetail(@Param('id') id: number) {
    return this.usersService.findOneBankDetail(+id);
  }

  @Patch('user-bank/:id')
  updateBankDetail(
    @Param('id') id: number,
    @Body() dto: UpdateBankDetailDto,
    @Req() req,
  ) {
    return this.usersService.updateBankDetail(+id, dto, req.user);
  }

  @Post('user-kyc/:id')
  createkycDetail(@Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateKycDetailDto,
    @Req() req
  ) {
    return this.usersService.createkycDetail(id, dto, req.user);
  }

  @Get('user-kyc/:id')
  findOnekycDetail(@Param('id') id: number) {
    return this.usersService.findOnekycDetail(+id);
  }

  @Patch('user-kyc/:id')
  updatekycDetail(
    @Param('id') id: number,
    @Body() dto: UpdateKycDetailDto,
    @Req() req,
  ) {
    return this.usersService.updatekycDetail(+id, dto, req.user);
  }






  /* @Delete('user-address/:id')
   removeAddress( @Param('id') id: number) {
     return this.usersService.removeAddress( id);
   }*/

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
