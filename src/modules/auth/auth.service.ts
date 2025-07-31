import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
 
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/admin/users/dto/create-user.dto';
import { UsersService } from 'src/modules/admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserListByRoleNameDto } from '../admin/users/dto/user-list-byrole.dto';
import { StartRegistrationDto } from './dto/start-registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpVerification } from 'src/shared/entities/OtpVerification.entity';
import { CompleteRegistrationDto } from './dto/ complete-registration.dto';
import { Role } from 'src/shared/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

     @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  
  @InjectRepository(OtpVerification)
  private readonly otpveriRepo: Repository<OtpVerification>,

   @InjectRepository(Role)
      private roleRepository: Repository<Role>,

  ) {}

async startRegistration(dto: StartRegistrationDto, ipAddress?: string) {
  const { identifier, type, userType } = dto;

  // ✅ Build where clause cleanly to avoid TypeScript errors
  const whereClause: any = {};
  if (type === 'email') {
    whereClause.email = identifier;
  } else {
    whereClause.mobile = identifier;
  }

  // ✅ Check if user already registered
  const existingUser = await this.userRepository.findOne({
    where: whereClause,
  });

  if (existingUser) {
    throw new ConflictException(`${type} is already registered`);
  }

  // ✅ Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Set OTP expiry (10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // ✅ Clean up previous unverified OTP records for same identifier/type
  await this.otpveriRepo.delete({
    identifier,
    type,
    isVerified: false,
  });

  // ✅ Save new OTP record
  const otpRecord = this.otpveriRepo.create({
    identifier,
    type,
    userType,
    otp,
    expiresAt,
    ipAddress,
  });

  await this.otpveriRepo.save(otpRecord);

  // TODO: Integrate email or SMS service
  // await this.emailService.sendOtp(identifier, otp);
  // or await this.smsService.sendOtp(identifier, otp);

  return {
    message: `OTP sent successfully to ${type} ${identifier}`,
    expiresInMinutes: 10,
    otp, // ⚠️ Only return OTP in dev/testing, not in production
  };
}

 

async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
  const { identifier, otp, type } = dto;

  const record = await this.otpveriRepo.findOne({
    where: {
      identifier,
      otp,
      type,
      isVerified: false,
    },
  });

  if (!record) {
    throw new NotFoundException('Invalid or expired OTP.');
  }
 
  const now = new Date();
  if (record.expiresAt < now) {
    throw new BadRequestException('OTP has expired.');
  }

  // Mark OTP as verified
  record.isVerified = true;
  await this.otpveriRepo.save(record);

  return { message: 'OTP verified successfully.' };
}



 async completeRegistration(dto: CompleteRegistrationDto) {
  const { identifier, type, username, password } = dto;

  // 1. Check verified OTP
  const otpRecord = await this.otpveriRepo.findOne({
    where: {
      identifier,
      type,
      isVerified: true,
    },
  });

  if (!otpRecord) {
    throw new NotFoundException('OTP not verified or expired.');
  }

  // 2. Check existing user
  const existing = await this.userRepository.findOne({
    where: type === 'email' ? { email: identifier } : { mobile: identifier },
  });

  if (existing) {
    throw new BadRequestException('User already registered.');
  }

    // 3. Fetch Role based on userType stored during OTP step
  const role = await this.roleRepository.findOne({
    where: { name: otpRecord.userType }, // e.g., 'artist', 'seller'
  });

  if (!role) {
    throw new NotFoundException("Role ${otpRecord.userType} not found");
  }

  // 4. Hash password
   const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create new user
 const user = this.userRepository.create({
  username,
  password:hashedPassword,
  email: type === 'email' ? identifier : null,
  mobile: type === 'mobile' ? identifier : null,
  roles: [role],
} as Partial<User>);

  await this.userRepository.save(user);

  // 6. Link user to OTP record
  otpRecord.user = user;
  await this.otpveriRepo.save(otpRecord);

  return { message: 'Registration completed successfully.', userId: user.id };
}

async buyerSignup(dto: CompleteRegistrationDto) {
  const { identifier, type, username, password } = dto;

  // 1. Check verified OTP
  const otpRecord = await this.otpveriRepo.findOne({
    where: {
      identifier,
      type,
      isVerified: true,
    },
  });

  if (!otpRecord) {
    throw new NotFoundException('OTP not verified or expired.');
  }

  // 2. Check existing user
  const existing = await this.userRepository.findOne({
    where: type === 'email' ? { email: identifier } : { mobile: identifier },
  });

  if (existing) {
    throw new BadRequestException('User already registered.');
  }

    // 3. Fetch Role based on userType stored during OTP step
  const role = await this.roleRepository.findOne({
    where: { name: otpRecord.userType }, // e.g., 'artist', 'seller'
  });

  if (!role) {
    throw new NotFoundException("Role ${otpRecord.userType} not found");
  }

  // 4. Hash password
   const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create new user
 const user = this.userRepository.create({
  username,
  password:hashedPassword,
  email: type === 'email' ? identifier : null,
  mobile: type === 'mobile' ? identifier : null,
  roles: [role],
} as Partial<User>);

  await this.userRepository.save(user);

  // 6. Link user to OTP record
  otpRecord.user = user;
  await this.otpveriRepo.save(otpRecord);

  return { message: 'Registration completed successfully.', userId: user.id };
}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
   // console.log('---------username-----------', username,'-----user------',user);
    if (user && (await bcrypt.compare(password, user.password))) {
     //  console.log('-------------Password-------', user.password);
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





 
}
