import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
 
import { UsersService } from 'src/modules/admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserListByRoleNameDto } from '../admin/users/dto/user-list-byrole.dto';
 
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpVerification } from 'src/shared/entities/OtpVerification.entity';
 
import { Role } from 'src/shared/entities/role.entity';
import { OtpService } from 'src/shared/otp/otp.service';
import { ResendOtpDto } from './dto/resend-verification.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { StartEmailVerificationDto, StartMobileVerificationDto } from './dto/start-verification.dto';
import { LoginDto } from './login.dto';
import { OtpLoginDto } from './dto/otp-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';

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

    private readonly otpService: OtpService,

  ) { }


  /************ Start registration Process */


  async sendEmailOtp(dto: StartEmailVerificationDto,ipAddress?: string) {
    return this.otpService.sendOtp(dto.email, 'email', dto.userType,ipAddress); // Only identifier and type passed
  }

  async sendMobileOtp(dto: StartMobileVerificationDto,ipAddress?: string) {
    return this.otpService.sendOtp(dto.mobile, 'mobile', dto.userType,ipAddress);
  }
 

  async resendOtp(dto: ResendOtpDto, ipAddress?: string) {
    return this.otpService.resendOtpByIdentifier(dto, ipAddress);
  }

  
async verifyOtp(dto: VerifyOtpDto) {
  return this.otpService.verifyOtp(dto);
}
 

  // src/auth/auth.service.ts

  async registerUser(dto: RegisterUserDto) {
    const { email, mobile, password, username, userType } = dto;
  
    // Check OTP verifications
    const [emailOtp, mobileOtp] = await Promise.all([
      this.otpService.getLatestVerifiedOtp(email, 'email'),
      this.otpService.getLatestVerifiedOtp(mobile, 'mobile'),
    ]);
  
    if (!emailOtp || !emailOtp.isVerified) {
      throw new BadRequestException('Email is not verified');
    }
  
    if (!mobileOtp || !mobileOtp.isVerified) {
      throw new BadRequestException('Mobile number is not verified');
    }
  
    // Fetch role by userType
    const role = await this.roleRepository.findOne({ where: { name: userType } });
  
    if (!role) {
      throw new BadRequestException(`Role '${userType}' not found`);
    }
  
    // Continue with user creation
    const user = this.userRepository.create({
      username,
      email,
      mobile,
      password: await bcrypt.hash(password, 10),
      roles: [role], // assign role in array for ManyToMany
    });
  
    await this.userRepository.save(user);
  
    return { success: true, message: 'Registration complete', userId: user.id };
  }


  async validateUser(dto: LoginDto): Promise<any> {
    const {loginId, password} = dto;
    let user;
  
    // Determine if it's email or mobile
    if (loginId.includes('@')) {
      user = await this.findByEmail(loginId);
    } else {
      user = await this.findByMobile(loginId);
    }
  
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
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

  async sendLoginOtp(dto: SendOtpDto, ipAddress?: string) {
    const { identifier, type, userType } = dto;
    return this.otpService.sendOtp(identifier,type,userType, ipAddress);
  }
  
 
  async loginWithOtp(dto: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp({ ...dto, userType: 'Login' });
  
    if (!result.success || !result.user) {
      throw new UnauthorizedException('Invalid OTP or user not found');
    }
  
    return this.login(result.user);
  }   
  
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  
  async findByMobile(mobile: string) {
    return this.userRepository.findOne({ where: { mobile } });
  }

  async findUsersByRole(roleName: string): Promise<UserListByRoleNameDto[]> {
    const users = await this.usersService.findUsersByRole(roleName);
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found for the specified role');
    }
    return users;
  }
 
}
  /* async create(createUserDto: CreateUserDto) {
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
   /* async sendOtpForLogin(identifier: string, type: 'email' | 'mobile', userType?: string, ipAddress?: string) {
    const user = await this.userRepo.findOne({ where: { [type]: identifier, ...(userType ? { userType } : {}) } });

    if (!user) throw new NotFoundException('User not registered');

    await this.checkRateLimit(identifier, type);

    const otp = this.generateOtp();
    const record = this.otpRepo.create({
      identifier,
      type,
      otp,
      user,
      ipAddress,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await this.otpRepo.save(record);

    await this.sendOtpToUser(identifier, type, otp);
    return { success: true, message: 'OTP sent successfully' };
  }*/
   
   

/**********  
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
      password: hashedPassword,
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
      password: hashedPassword,
      email: type === 'email' ? identifier : null,
      mobile: type === 'mobile' ? identifier : null,
      roles: [role],
    } as Partial<User>);

    await this.userRepository.save(user);

    // 6. Link user to OTP record
    otpRecord.user = user;
    await this.otpveriRepo.save(otpRecord);

    return { message: 'Registration completed successfully.', userId: user.id };
  }*/
 /* async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    // console.log('---------username-----------', username,'-----user------',user);
    if (user && (await bcrypt.compare(password, user.password))) {
      //  console.log('-------------Password-------', user.password);
      const { password, ...result } = user;
      return result; // return user info without password
    }
    return null;
  }*/
/*  async isVerified(identifier: string): Promise<boolean> {
    return this.otpService.isVerified(identifier);
  }

  async register(dto: RegisterUserDto) {
    const userExists = await this.userRepo.findByEmailOrMobile(dto.email, dto.mobile);
    if (userExists) throw new BadRequestException('User already exists');

    return this.userRepo.createUser(dto);
  }


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
*/

  /*async resendEmailOtp(email: string) {
    return this.otpService.resendOtp(email, 'email');
  }
   async resendMobileOtp(mobile: string) {
    return this.otpService.resendOtp(mobile, 'mobile');
  }
  


   async verifyOtps(dto: VerifyOtpDto): Promise<{ message: string }> {
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
  */