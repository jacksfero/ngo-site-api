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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUsersAboutDto } from './dto/create-users-about.dto';
import { UpdateUsersAboutDto } from './dto/update-users-about.dto';
 

import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

import { UsersListDto } from './dto/users-list.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
  
import { USERS_LIMIT, USERS_MAX_LIMIT, USERS_PAGE } from 'src/shared/config/pagination.config';
import { CreateUserAddressDto } from 'src/modules/auth/dto/create-user-address.dto';
import { UpdateUserAddressDto } from 'src/modules/auth/dto/update-user-address.dto';
import { CreateBankDetailDto } from './dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from './dto/update-user-bank-detail.dto';
import { CreateKycDetailDto, UpdateKycDetailDto } from './dto/create-user-kyc-detail.dto';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { AddressType } from 'src/shared/entities/users-address.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';

@Controller()
//@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
 
  @Post()
  @RequirePermissions('create_user')
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user);
  }
 
  @Get()
  @RequirePermissions('read_user')
  async findAll(
    @Query(new PaginationClinetPipe(USERS_LIMIT, USERS_MAX_LIMIT, USERS_PAGE))
    paginationDto: UserPaginationDto
  ): Promise<PaginationResponseDto<UsersListDto>> {
    return this.usersService.findAll(paginationDto);
  } 
   
 @Get('by-role')
//@RequirePermissions('read_user')
async getUsersByRoles(
  @Query('roles') roles: string,   // comma-separated roles: seller,artist
  @Query('featured_artist') featured_artist?: boolean,
) {
  const roleList = roles.split(',').map(r => r.trim());
  const users = await this.usersService.findUsersByRole(roleList, featured_artist ?? undefined);
  return users;
}

  @Get('artisttypelist')
  @RequirePermissions('read_user')
  GetArtistTypeList() {
    return this.usersService.GetArtistTypeList();
  }

  @Post('upload/:userId')
  @RequirePermissions('create_user')
  @UseInterceptors(FileInterceptor('profileimage'))
  uploadProfileImage(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,    
     @Req() req
  ) {
    return this.usersService.uploadProfileImage(userId,file,req.user);
  }

  @Get('profileimage/:userId')
  @RequirePermissions('read_user')
  geProfileImage( @Param('userId', ParseIntPipe) userId: number,) {
    return this.usersService.geProfileImage(userId);
  }

  /** Start User about us section */
  @Post('about/:userId')
  @RequirePermissions('create_user')
  createUserAbout(@Param('userId', ParseIntPipe) userId: number, @Body() dto: CreateUsersAboutDto, @Req() req) {
    return this.usersService.createUserAbout(dto, userId, req.user);
  }

  @Get('about/:userId')
  @RequirePermissions('read_user')
  findOneUserAbout(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOneAboutByUserId(userId);
  }

  @Patch('about/:id')
  @RequirePermissions('update_user')
  updateUserAbout(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsersAboutDto) {
    return this.usersService.updateUserAbout(id, dto);
  }

  @Delete('about/:id')
  @RequirePermissions('delete_user')
  removeUserAbout(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUserAbout(id);
  }

  @Post('user-address/:id')
  @RequirePermissions('read_user')
  createAddress(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUserAddressDto, @Req() req) {
    return this.usersService.createAddress(dto, id, req.user);
  }

  @Get('user-address/:id/:addressType')
  @RequirePermissions('read_user')
  findAllAddress(
    @Param('id', ParseIntPipe) id: number,
    @Param('addressType', new ParseEnumPipe(AddressType)) addressType: AddressType,
  ) {
    return this.usersService.findAllForUserAddress(id,addressType);
  }

  @Patch('user-address/:id')
  @RequirePermissions('update_user')
  updateAddress(@Param('id') id: number, @Body() dto: UpdateUserAddressDto, @Req() req) {
    return this.usersService.updateAddress(id, dto, req.user);
  }
 
  @Post('user-bank/:id')
  @RequirePermissions('create_user')
  createBankDetail(@Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBankDetailDto,
    @Req() req
  ) {
    return this.usersService.createBankDetail(id, dto, req.user);
  }

  @Get('user-bank/:id')
  @RequirePermissions('read_user')
  findOneBankDetail(@Param('id') id: number) {
    return this.usersService.findOneBankDetail(+id);
  }

  @Patch('user-bank/:id')
  @RequirePermissions('update_user')
  updateBankDetail(
    @Param('id') id: number,
    @Body() dto: UpdateBankDetailDto,
    @Req() req,
  ) {
    return this.usersService.updateBankDetail(+id, dto, req.user);
  }

  @Post('user-kyc/:id')
  @RequirePermissions('create_user')
  createkycDetail(@Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateKycDetailDto,
    @Req() req
  ) {
    return this.usersService.createkycDetail(id, dto, req.user);
  }

  @Get('user-kyc/:id')
  @RequirePermissions('read_user')
  findOnekycDetail(@Param('id') id: number) {
    return this.usersService.findOnekycDetail(+id);
  }

  @Patch('user-kyc/:id')
  @RequirePermissions('update_user')
  updatekycDetail(
    @Param('id') id: number,
    @Body() dto: UpdateKycDetailDto,
    @Req() req,
  ) {
    return this.usersService.updatekycDetail(+id, dto, req.user);
  }
 
  /** End User about us section */
  @Get(':id')
 // @RequirePermissions('read_user')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('update_user')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }

  @Post(':id/roles')
  @RequirePermissions('assign_roles')
  assignRoles(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.assignRolesToUser(+id, dto);
  }
 
  @Patch(':id')
  @RequirePermissions('update_user')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('delete_user')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }



}
