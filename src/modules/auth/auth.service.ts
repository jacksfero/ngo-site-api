import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/admin/users/dto/create-user.dto';
import { UsersService } from 'src/modules/admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserListByRoleNameDto } from '../admin/users/dto/user-list-byrole.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    console.log('---------username-----------', username,'-----user------',user);
    if (user && (await bcrypt.compare(password, user.password))) {
       console.log('-------------Password-------', user.password);
      const { password, ...result } = user;
      return result; // return user info without password
    }
    return null;
  }
  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,

      roles: user.roles,
      permissions: user.email, // optional
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existingByUsername = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (existingByUsername) {
      throw new ConflictException('Username already taken');
    }

    const existingByEmail = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException('Email already registered');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // return 'This action adds a new auth';
    return this.login(user);
  }

    async findUsersByRole(roleName: string) : Promise<UserListByRoleNameDto[]> {
     const users = await this.usersService.findUsersByRole(roleName);
     if (!users || users.length === 0) {
    throw new NotFoundException('No users found for the specified role');
  }
    return users;
  }





  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
