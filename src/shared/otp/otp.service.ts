import { Injectable, Inject,Logger,ForbiddenException, HttpException, HttpStatus, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OtpVerification } from '../entities/OtpVerification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository,FindOptionsWhere } from 'typeorm';
import { addMinutes, differenceInSeconds, isAfter, subMinutes } from 'date-fns';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/resend-verification.dto';
import { User } from '../entities/user.entity';
import { OtpType,UserType } from 'src/modules/auth/dto/start-verification.dto';

export type OtpVerificationResult =
  | { success: true; message: string; user?: undefined }
  | { success: true; message: string; user: User };


@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  constructor(

    @InjectRepository(User)
    private readonly userReposs: Repository<User>,

    @InjectRepository(OtpVerification)
    private readonly otpRepository: Repository<OtpVerification>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache // for IP rate limiting (optional)
  ) {}


  private generateOtpCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 6-digit OTP
  }

   

  async verifyOtp(dto: VerifyOtpDto): Promise<OtpVerificationResult> {
    const { identifier, type, otp,userType } = dto;

    
    const record = await this.otpRepository.findOne({
      where: { identifier, type,userType },
      relations: ['user'], // Ensure user is loaded
    });
  
    if (!record) {
      throw new BadRequestException('No OTP request found for this identifier');
    }
    
    if (record.isVerified) {
      return record.user
        ? { success: true, message: 'Already verified', user: record.user }
        : { success: true, message: 'Already verified' };
    }
  
    const now = new Date();
  
    if (record.expiresAt < now) {
      throw new BadRequestException('OTP has expired. Please resend OTP.');
    }
  
    if (record.attempts >= 5) {
      throw new ForbiddenException('Too many incorrect attempts');
    }
  
    if (record.otp !== otp) {
      record.attempts += 1;
      await this.otpRepository.save(record);
      throw new BadRequestException('Invalid OTP');
    }
  
    record.isVerified = true;
    record.attempts = 0;
    await this.otpRepository.save(record);
  
    if (record.user) {
      return { success: true, message: 'OTP verified', user: record.user };
    }
  
    return { success: true, message: 'OTP verified' };
  }
  async resendOtp(
    identifier: string,
    type: OtpType,
    userType?: UserType,
    ipAddress?: string,
  ) {
    return this.sendOtp(identifier, type, userType, ipAddress);
  }
  

  async resendOtpByIdentifier(dto: ResendOtpDto, ipAddress?: string) {
    let identifier: string;
    let type: OtpType;

    if (dto.email) {
      identifier = dto.email;
      type = OtpType.EMAIL;
    } else if (dto.mobile) {
      identifier = dto.mobile;
      type = OtpType.MOBILE;
    } else {
      throw new BadRequestException('Either email or mobile must be provided.');
    }
    const userType = dto.userType || undefined;
   

    return this.resendOtp(identifier, type, userType, ipAddress);
  }

 
    async sendOtp(
    identifier: string,
    type: OtpType,
    userType?: UserType, // default to 'Login' to separate from registration
    ipAddress?: string,
  ): Promise<{ success: true; message: string }>  {
    if (!ipAddress) {
      throw new BadRequestException('IP address is required.');
    }
  
    // Rate limit: Max 50 OTPs per IP per day
    const ipKey = `otp:ip:${ipAddress}`;
    const ipCount = (await this.cacheManager.get<number>(ipKey)) || 0;
    if (ipCount >= 50) {
      
      throw new HttpException(
        'Too many OTP requests from this IP today.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
   
    }
    await this.cacheManager.set(ipKey, ipCount + 1, 86400);
  
    // Find user by identifier
    /*** For registration********** */
    const user = await this.userReposs.findOne({ where: { [type]: identifier } });
    const isRegistrationFlow = userType !== UserType.LOGIN && userType !== UserType.FORGOT_PASSWORD;

      // Simplified conditions
      if (!user && !isRegistrationFlow) {
        throw new NotFoundException('User not registered');
      }

      if (user && isRegistrationFlow) {
        throw new BadRequestException('User already exists');
      }
    const otp = this.generateOtpCode();
    const expiresAt = addMinutes(new Date(), 10);
    const tenMinutesAgo = subMinutes(new Date(), 10);
  
    const existingOtp = await this.otpRepository.findOne({ where: { identifier, type, userType } });
  
    if (existingOtp) {
      if (isAfter(existingOtp.updatedAt, tenMinutesAgo) && existingOtp.attempts >= 3) {
        
        throw new HttpException(
          'Too many OTP requests. Try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
  
      if (differenceInSeconds(new Date(), existingOtp.updatedAt) < 30) {
        this.logger.warn(`Please wait before requesting -- ${differenceInSeconds(new Date(), existingOtp.updatedAt)} another OTP: ${existingOtp.updatedAt} -new date ${new Date()}- user data- ${JSON.stringify(existingOtp)}`);
        throw new BadRequestException('Please wait before requesting another OTP.');
      }
  
      existingOtp.otp = otp;
      existingOtp.expiresAt = expiresAt;
      existingOtp.isVerified = false;
      existingOtp.userType = userType;
      existingOtp.ipAddress = ipAddress;
      if (user) {
        existingOtp.user = user;
      }
       
      existingOtp.attempts = isAfter(existingOtp.updatedAt, tenMinutesAgo)
        ? existingOtp.attempts + 1
        : 1;
  
      await this.otpRepository.save(existingOtp);
    } else {
      const otpEntity = this.otpRepository.create({
        identifier,
        type,
        otp,
        expiresAt,
        attempts: 1,
        userType,
        user: user ?? undefined,
        ipAddress,
      });
      await this.otpRepository.save(otpEntity);
    }
  
    console.log(`OTP sent to ${type}: ${identifier} => ${otp}`);
  //  return { success: true, message: `OTP sent to your ${type}` };
    return { success: true, message: `OTP sent to your ${otp}` };
   // return { otp };
  }

 
  async getLatestVerifiedOtp(
    identifier: string,
    type: 'email' | 'mobile',
  ): Promise<OtpVerification | null> {
    return this.otpRepository.findOne({
      where: { identifier, type: type as OtpType, isVerified: true },
      order: { updatedAt: 'DESC' },
    });
  }

 /*
  async sendOtpToUser(identifier: string, type: 'email' | 'mobile', otp: string) {
    // integrate with your SMS or email service
    console.log(`Sending OTP ${otp} to ${type}: ${identifier}`);
  }

  async checkRateLimit(identifier: string, type: 'email' | 'mobile') {
    const recentOtps = await this.otpRepository.count({
      where: {
        identifier,
        type,
        createdAt: MoreThan(new Date(Date.now() - 10 * 60 * 1000)),
      },
    });
    if (recentOtps >= 3) {
     // throw new HttpException('Too many OTP requests. Please try later.');
      throw new HttpException(
        'Too many OTP requests. Please wait before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

 

  }


*/
 

}
  /*async resendOtp(
    identifier: string,
    type: 'email' | 'mobile',
    userType?: string,
    ipAddress?: string,
  ): Promise<{ otp: string }> {
    return this.sendOtp(identifier, type, userType, ipAddress);
  }

  async isOtpVerified(identifier: string, type: 'email' | 'mobile'): Promise<boolean> {
    const record = await this.otpRepository.findOne({ where: { identifier, type } });
    return !!record?.isVerified;
  }

  async resendOtp(
    identifier: string,
    type: 'email' | 'mobile',
    userType?: string,
    ipAddress?: string,
  ): Promise<{ otp: string; message: string }> {
    const existing = await this.otpRepository.findOne({
      where: { identifier, type },
    });

    if (!existing) {
      throw new Error('OTP not found for this identifier. Please initiate verification.');
    }


    const now = new Date();
    const lastSent = existing.updatedAt;
    const cooldownMs = 60 * 1000; // 60 seconds

    if (lastSent && now.getTime() - lastSent.getTime() < cooldownMs) {
      throw new Error('Please wait before requesting a new OTP.');
    }

    const otp = this.generateOtpCode();
    const expiresAt = addMinutes(new Date(), 10);

    existing.otp = otp;
    existing.expiresAt = expiresAt;
    existing.isVerified = false;
    existing.userType = userType;
    existing.ipAddress = ipAddress;

    await this.otpRepository.save(existing);

    // TODO: Send OTP via email/SMS
    console.log(`Resent OTP for ${type} ${identifier}: ${otp}`);

    return {
      otp,
      message: 'OTP resent successfully',
    };

  }
   
  
  
   async resendOtpByIdentifiers(dto: ResendOtpDto, ipAddress?: string) {
    const { email, mobile, userType } = dto;
    let identifier: string;
    let type: 'email' | 'mobile';

    if (email) {
      identifier = email;
      type = 'email';
    } else if (mobile) {
      identifier = mobile;
      type = 'mobile';
    } else {
      throw new BadRequestException('Either email or mobile must be provided.');
    }

    const existing = await this.otpRepository.findOne({
      where: { identifier, type },
    });

    if (!existing) {
      throw new BadRequestException('OTP not found for this identifier. Please initiate verification.');
    }

    // Optional cooldown
    const now = new Date();
    const lastSent = existing.updatedAt;
    const cooldownMs = 30 * 1000; // 1 minute cooldown

    if (lastSent && now.getTime() - lastSent.getTime() < cooldownMs) {
      throw new BadRequestException('Please wait before requesting a new OTP.');
    }

    const otp = this.generateOtpCode();
    const expiresAt = addMinutes(now, 10);
    //console.log('ssssssssss-----------');
    existing.otp = otp;
    existing.expiresAt = expiresAt;
    existing.isVerified = false;
    if (userType) {
      existing.userType = userType;
    }
    existing.ipAddress = ipAddress;

    await this.otpRepository.save(existing);

    console.log(`Resent OTP for ${type} ${identifier}: ${otp}`); // Only in dev

    return { otp, message: 'OTP resent successfully' };
  }
  




  async sendOtp(
    identifier: string,
    type: 'email' | 'mobile',
    userType?: string,
    ipAddress?: string,
  ): Promise<{ otp: string }> {

    
    // 1. Global IP rate limiting (max 50/day)
    const ipKey = `otp:ip:${ipAddress}`;
    const ipRequestCount = (await this.cacheManager.get<number>(ipKey)) || 0;
    if (ipRequestCount >= 50) {
      throw new HttpException('Too many OTP requests. Please wait.', HttpStatus.TOO_MANY_REQUESTS);
    }
    await this.cacheManager.set(ipKey, ipRequestCount + 1, 86400); // 24 hours
  
    // 2. Existing user check
   // const existingUser =
    //  type === 'email'
     //   ? await this.userReposs.findOne({ where: { email: identifier } })
     //   : await this.userReposs.findOne({ where: { mobile: identifier } });
   
        const existingUser = await this.otpRepository.findOne({ where: { identifier, type } });
   
        if (userType === 'login' && !existingUser) {
          throw new NotFoundException('User not found');
        }

        if (userType !== 'login' && existingUser) {
          throw new BadRequestException('User already exists');
        }
  
    // 3. OTP preparation
    const otp = this.generateOtpCode();
    const expiresAt = addMinutes(new Date(), 10);
    const tenMinutesAgo = subMinutes(new Date(), 10);
  
    // 4. Fetch existing OTP entry
    const existingOtp = await this.otpRepository.findOne({
      where: { identifier, type },
    });
  
    // 5. Rate limit: max 3 attempts in last 10 minutes
    if (existingOtp) {
      if (isAfter(existingOtp.updatedAt, tenMinutesAgo) && existingOtp.attempts >= 3) {
        throw new HttpException(
          'Too many OTP requests. Please wait before trying again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
  
      // 6. Cooldown: must wait 60 seconds between requests
      if (differenceInSeconds(new Date(), existingOtp.updatedAt) < 30) {
        throw new BadRequestException('Please wait before requesting another OTP.');
      }
  
      // 7. Update existing OTP
      existingOtp.otp = otp;
      existingOtp.expiresAt = expiresAt;
      existingOtp.isVerified = false;
      existingOtp.userType = userType;
      existingOtp.ipAddress = ipAddress;
  
      if (isAfter(existingOtp.updatedAt, tenMinutesAgo)) {
        existingOtp.attempts += 1;
      } else {
        existingOtp.attempts = 1; // reset after cooldown
      }
  
      await this.otpRepository.save(existingOtp);
    } else {
      // 8. First-time request — create new entry
      const otpEntity = this.otpRepository.create({
        identifier,
        type,
        otp,
        expiresAt,
        attempts: 1,
        userType,
        ipAddress,
      });
      await this.otpRepository.save(otpEntity);
    }
  
    console.log(`OTP for ${type} ${identifier}: ${otp}`);
    return { otp };
  }
   async sendOtpForLogin1(identifier: string, type: 'email' | 'mobile', userType?: string, ipAddress?: string) {
    
    const where: FindOptionsWhere<User> = {
      [type]: identifier,
    };
     
    const user = await this.userReposs.findOne({ where });
    if (!user) throw new NotFoundException('User not registered');

    await this.checkRateLimit(identifier, type);

   // userType = 'Login';
   const now = new Date();
    const otp = this.generateOtpCode();
    const expiresAt = addMinutes(now, 10);
    const record = this.otpRepository.create({
      identifier,
      type,
      otp,
      userType,
      user,
      ipAddress,
      expiresAt,
    });
    await this.otpRepository.save(record);

    //await this.sendOtpToUser(identifier, type, otp);
    return { success: true, message: 'OTP sent successfully' };
  }

  */

  