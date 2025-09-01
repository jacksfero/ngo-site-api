// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,  
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, ILike, FindOptionsWhere, Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { UserListByRoleNameDto } from './dto/user-list-byrole.dto';
import { UsersAbout } from '../../../shared/entities/users-about.entity';
import { CreateUsersAboutDto } from './dto/create-users-about.dto';
import { UpdateUsersAboutDto } from './dto/update-users-about.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { UsersListDto } from './dto/users-list.dto';
 import { UserPaginationDto } from './dto/user-pagination.dto';
import { AddressType, UsersAddress } from 'src/shared/entities/users-address.entity';
import { CreateUserAddressDto } from 'src/modules/auth/dto/create-user-address.dto';
import { UpdateUserAddressDto } from 'src/modules/auth/dto/update-user-address.dto';
import { BankDetail } from 'src/shared/entities/user-bank-detail.entity';
import { CreateBankDetailDto } from './dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from './dto/update-user-bank-detail.dto';
import { KycDetails } from 'src/shared/entities/user-kyc.entity';
import { CreateKycDetailDto, UpdateKycDetailDto } from './dto/create-user-kyc-detail.dto';
 

@Injectable()
export class UsersService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,
  
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,


     @InjectRepository(UsersAbout)
    private aboutRepo: Repository<UsersAbout>,

    @InjectRepository(UsersAddress)
    private addressRepo: Repository<UsersAddress>,

    @InjectRepository(BankDetail)
    private bankRepo: Repository<BankDetail>,

    @InjectRepository(KycDetails)
    private kycRepo: Repository<KycDetails>,


  ) {}

  async create(dto: CreateUserDto, currentUser: any): Promise<User> {
    const { roleIds, status, email, mobile, ...rest } = dto;
  
     // 🔍 Step 1: Check if user already exists by email or mobile
  const existingUser = await this.userRepository.findOne({
    where: [
      { email },
      { mobile },
    ],
  });

  if (existingUser) {
    throw new BadRequestException('User with this email or mobile already exists');
  }
  const hashedPassword = await bcrypt.hash(dto.password, 10)
    // Step 1: Create the user entity
    const newUser = this.userRepository.create({
      ...rest,
      email,
      mobile,
      password:hashedPassword,
    //  status: status === true ? 'active' : status === false ? 'inactive' : undefined,
    });
  
    // Step 2: Load roles and assign
    if (roleIds?.length) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      newUser.roles = roles;
    }
    newUser.createdBy = currentUser.sub.toString();

    // You can optionally log or use currentUser here for audit tracking
  
    // Step 3: Save user
    return await this.userRepository.save(newUser);
  }
 

  async findUsersByRole(roleName: string):  Promise<UserListByRoleNameDto[]> {
   const users = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .where('role.name = :roleName', { roleName })
    .andWhere('user.status = :status', { status: true })
    .select([
      'user.id',
      'user.username',
      
    ])
    .getMany();
 if (!users || users.length === 0) {
      throw new NotFoundException('No users found with the given role');
    }
    return plainToInstance(UserListByRoleNameDto, users, { excludeExtraneousValues: true });
}


async findByUsername_bk(username: string): Promise<User | null> {
   //console.log(`User searchsssssssssssssssssss failed for ${username}` );
  try {
    return await this.userRepository.findOne({ 
      where: { username },
      select: ['id', 'username', 'password'] // Customize as needed
    });
  } catch (error) {
    throw new Error(`User search failed for ${username}`, error.stack);
   // return null; // Explicit null (TypeORM's standard)
  }
}

async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { username },
       relations: ['roles'], // Include roles if you need them in JWT
    });

    return user ?? undefined;
  }
   
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }
  async findAll(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationResponseDto<UsersListDto>> {
    const { page , limit, search,status,is_verified,role  } = paginationDto;
    const skip = (page - 1) * limit;
    //const search = search || '';
  
    const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .orderBy('user.createdAt', 'DESC')
    .take(limit)
    .skip(skip);
  
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.mobile) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (typeof status === 'boolean') {
      console.log('status----------',status)
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (typeof is_verified === 'boolean') {
      queryBuilder.andWhere('user.is_verified = :is_verified', { is_verified });
    }
  
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    } 
  
    const [result, total] = await queryBuilder.getManyAndCount();
  
    const data = plainToInstance(UsersListDto, result, {
      excludeExtraneousValues: true,
    });
  
    return new PaginationResponseDto(data, { total, page, limit  });
  }
 /* async findAll(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationResponseDto<UsersListDto>> {
    const { page = USERS_PAGE, limit = USERS_LIMIT, search,is_verified, status, role } = paginationDto;
    const skip = (page - 1) * limit;
    
  
    const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .orderBy('user.createdAt', 'DESC')
    .take(limit)
    .skip(skip);
  
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.mobile) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (typeof status === 'boolean') {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (typeof status === 'boolean') {
      queryBuilder.andWhere('user.is_verified = :is_verified', { is_verified });
    }
  
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }
  
    const [result, total] = await queryBuilder.getManyAndCount();
  
    const data = plainToInstance(UsersListDto, result, {
      excludeExtraneousValues: true,
    });
  
    return new PaginationResponseDto(data, { total, page, limit });
  }*/

 async findOne(id: number) {
    try {
    return await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles'], // include relations if needed
      select: ['id', 'username', 'password'] // Customize as needed
    });
  } catch (error) {
    throw new Error(`User search failed for ${id}`, error.stack);
   // return null; // Explicit null (TypeORM's standard)
  }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const { roleIds, email, mobile, ...rest } = dto;

    // Step 1: Find the user
    const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Step 2: Check if email/mobile is already used by another user
    if (email) {
      const emailTaken = await this.userRepository.findOne({
        where: { email, id: Not(id) },
      });
      if (emailTaken) {
        throw new BadRequestException('Email already in use by another user');
      }
    }

    if (mobile) {
      const mobileTaken = await this.userRepository.findOne({
        where: { mobile, id: Not(id) },
      });
      if (mobileTaken) {
        throw new BadRequestException('Mobile already in use by another user');
      }
    }

    // Step 3: Merge fields
    Object.assign(user, { ...rest });
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    // Step 4: Update roles if provided
    if (roleIds?.length) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      user.roles = roles;
    }
 
    // Step 5: Save updated user
    return await this.userRepository.save(user);
  }
 
  async toggleStatus(id: number): Promise<User> {
    const surface = await this.userRepository.findOne({ where: { id } });
    if (!surface) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    surface.status = !surface.status;
    

    return this.userRepository.save(surface);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async assignRolesToUser(userId: number, dto: UpdateUserDto): Promise<User> {
    // 1. Find user with roles
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

     let roles: Role[] = []; // ✅ Declare type explicitly

    // 2. If roleIds is provided, fetch roles
    if (dto.roleIds?.length) {
      roles = await this.roleRepository.findBy({
        id: In(dto.roleIds),
      });

      // 3. Check for missing roles
      if (roles.length !== dto.roleIds.length) {
        const missingIds = dto.roleIds.filter(
          (id) => !roles.some((role) => role.id === id),
        );
        throw new NotFoundException(
          `Roles not found: ${missingIds.join(', ')}`,
        );
      }

      // 4. Assign roles to user
      user.roles = roles;
    } else {
      // 5. Clear roles if roleIds is empty or undefined
      user.roles = [];
    }

    // 6. Save user with updated roles
    return this.userRepository.save(user);
  }

  async getUserWithRoles(userId: number): Promise<User> {
    const User = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!User) {
      throw new NotFoundException(`Permission '${userId}' not found`);
    }
    return User;
  }




/** Start User about us section */
 async createUserAbout(dto: CreateUsersAboutDto,userId: number,users:any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const about = this.aboutRepo.create({ ...dto, user });
       about.createdBy = users.sub.toString();
    return this.aboutRepo.save(about);
  }

    async findOneAboutByUserId(userId: number) {
    return this.aboutRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }


   async updateUserAbout(userId: number, dto: UpdateUsersAboutDto) {
   const about = await this.aboutRepo.findOne({
  where: { user: { id: userId } },
  relations: ['user'], // optional, only if you need full user object
});
    if (!about) throw new NotFoundException('User About not found');

    if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('User not found');
      about.user = user;
    }

    Object.assign(about, dto);
    return this.aboutRepo.save(about);
  }


  async deleteUserAbout(id: number) {
    const result = await this.aboutRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('About not found');
    return { deleted: true };
  }


  // async createAddress(dto: CreateUserAddressDto,userId: number,  user: any) {
  //   const address = this.addressRepo.create({
  //     ...dto,
  //     user: { id: userId },
  //     createdBy:user.sub.toString(),
  //     updatedBy: user.sub.toString(),
  //   });
  // //  console.log('Address-------',address);
  //   return await this.addressRepo.save(address);
  // }

  async createAddress(dto: CreateUserAddressDto,userId: number,  user: any) {
    // limit rules
    if (dto.type === AddressType.PERSONAL) {
      const existing = await this.addressRepo.count({ where: { userId, type: AddressType.PERSONAL } });
      if (existing >= 1) {
        throw new BadRequestException('You can only have one personal address');
      }
    } else {
      const count = await this.addressRepo.count({ where: { userId, type: dto.type } });
      if (count >= 5) {
        throw new BadRequestException(`You can only add up to 5 ${dto.type} addresses`);
      }
    }
 // console.log('----------------');  
    const address = this.addressRepo.create({ ...dto, 
              userId,
        createdBy:user.sub.toString(),
       // updatedBy: user.sub.toString(),

     });
  
    if (dto.isDefault && dto.type !== AddressType.PERSONAL) {
      await this.addressRepo.update({ userId, type: dto.type }, { isDefault: false });
    }
   // console.log('-------222222222---------',address); //process.exit;
    return this.addressRepo.save(address);
  }

  async findAllForUserAddress(userId: number) {
    return await this.addressRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async updateAddress(id: number, dto: UpdateUserAddressDto, user:any) {
    const address = await this.addressRepo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
   // if (address.user.id !== user.sub.toString()) throw new ForbiddenException('Not allowed');

    Object.assign(address, dto);
    address.updatedBy = user.sub.toString()
    return await this.addressRepo.save(address);
  }

  async removeAddress(userId: number, id: number) {
    const address = await this.addressRepo.findOne({ where: { id }, relations: ['user'] });
    if (!address) throw new NotFoundException('Address not found');
    if (address.user.id !== userId) throw new ForbiddenException('Not allowed');

    await this.addressRepo.remove(address);
    return { message: 'Address deleted successfully' };
  }

  async createBankDetail(userId: number, dto: CreateBankDetailDto, user: any) {
    if (dto.isDefault) {
      // reset existing default
      await this.bankRepo.update({ userId }, { isDefault: false });
    }

    const bank = this.bankRepo.create({
      ...dto,
      userId,
      createdBy: user.sub.toString(),
     // updatedBy: user.sub.toString(),
    });

    return this.bankRepo.save(bank);
  }

  async findAllBankDetail(userId: number) {
    return this.bankRepo.find({ where: { userId } });
  }

  async findOneBankDetail(  userId: number) {
    const bank = await this.bankRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'], // optional, only if you need full user object
    });
    return bank;
  }

  async updateBankDetail( userId: number, dto: UpdateBankDetailDto, user: any) {
    const bank = await this.bankRepo.findOne({
      where: { userId:  userId   },
     // relations: ['user'], // optional, only if you need full user object
    });
        if (!bank) throw new NotFoundException('Bank Detail not found');
    
        if (userId) {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) throw new NotFoundException('User not found');
          bank.user = user;
        }
    
    Object.assign(bank, dto);
    bank.updatedBy = user.sub.toString()
    return await this.bankRepo.save(bank);
  }

  async removeBankDetail(id: number, userId: number) {
    return this.bankRepo.delete({ id, userId });
  }

  async createkycDetail(userId: number, dto: CreateKycDetailDto, user: any) {
    const exitkyc = await this.kycRepo.findOne({
      where: { userId:  userId   }   });  
   
    if (exitkyc) {
      Object.assign(exitkyc, dto);
      return await this.kycRepo.save(exitkyc);
    }

    const bank = this.kycRepo.create({
      ...dto,
      userId,
      createdBy: user.sub.toString(),
     // updatedBy: user.sub.toString(),
    });

    return this.kycRepo.save(bank);
  }
  async findOnekycDetail(  userId: number) {
    const bank = await this.kycRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'], // optional, only if you need full user object
    });
    return bank;
  }

  async updatekycDetail( userId: number, dto: UpdateKycDetailDto, user: any) {
    const bank = await this.kycRepo.findOne({
      where: { userId:  userId   },
     // relations: ['user'], // optional, only if you need full user object
    });
        if (!bank) throw new NotFoundException('Kyc Details not found');
    
        if (userId) {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) throw new NotFoundException('User not found');
          bank.user = user;
        }
    
    Object.assign(bank, dto);
    bank.updatedBy = user.sub.toString()
    return await this.kycRepo.save(bank);
  }
}


/*************
 * 
 * 
 * 
@Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
} 



async create(dto: CreateUserDto) {
  const user = this.userRepo.create(dto);
  return this.userRepo.save(user);
}

async update(id: number, dto: UpdateUserDto) {
  await this.userRepo.update(id, dto);
  return this.findOne(id);
}

async remove(id: number) {
  await this.userRepo.softDelete(id); // or hard delete
}
 * 
 * 
 * */