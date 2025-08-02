// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,  
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
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

@Injectable()
export class UsersService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,
  
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,


     @InjectRepository(UsersAbout)
    private aboutRepo: Repository<UsersAbout>,

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
 //  .andWhere('user.status = :status', { status: true })
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

    async findAll(): Promise<User[]> {
      try {
        return this.userRepository.find({
      relations: ['roles'], // include relations if needed
    });
      } catch (error) {
        throw new Error(`User search failed for  node found` );
      }
    
  }

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