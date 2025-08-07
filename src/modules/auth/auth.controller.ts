import { Request as ExpressRequest } from 'express';
import {
  Controller,
  Get, 
  Request as Req,
  UseGuards,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Ip,
} from '@nestjs/common';
import { AuthService } from './auth.service';

 
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/decorators/public.decorator';
import { PublicGuard } from 'src/core/guards/public.guard';
 
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { OtpType, StartEmailVerificationDto,StartMobileVerificationDto } from './dto/start-verification.dto';
import { ResendOtpDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login.dto';
//import { OtpLoginDto } from './dto/otp-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
 



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
 
/**
   * Step 1: Start Registration - Send OTP
   * POST /auth/start-registration
   */

 
 




@Public()
@Post('start-email-verification')
startEmail(@Body() dto: StartEmailVerificationDto, @Req() req: ExpressRequest) {
  const ipAddress = req.ip  ;
  return this.authService.sendEmailOtp(dto.email, OtpType.EMAIL, dto.userType,ipAddress);
}

 

@Public()
@Post('start-mobile-verification')
startMobile(@Body() dto: StartMobileVerificationDto, @Req() req: ExpressRequest) {
  const ipAddress = req.ip  ;
  return this.authService.sendMobileOtp(dto.mobile, OtpType.MOBILE, dto.userType,ipAddress);
}

@Public()
@Post('resend-verification')
resendOtp(@Body() dto: ResendOtpDto , @Req() req: ExpressRequest) {
  // const ipAddress = req.ip;
   const ipAddress = req.ip ;
  return this.authService.resendOtp(dto, ipAddress);
}
/*
@Post('resend-verification')
resendOtp(@Body() dto: ResendOtpDto, @Req() req: Request) {
  const ipAddress = req.ip;
  return this.authService.resendOtp(dto, ipAddress);
}*/


@Public()
@Post('verify-otp')
verifyOtp(@Body() dto: VerifyOtpDto) {
  return this.authService.verifyOtp(dto);
}


@Public()
@Post('register')
register(@Body() dto: RegisterUserDto) {
  return this.authService.registerUser(dto);
}


   //  @UseGuards(AuthGuard('local'))  
  @Public()
  @UseGuards(LocalAuthGuard) // ✅ This is KEY
  @Post('login')
  async login(@Req() req: ExpressRequest) {
    return this.authService.login(req.user); // ✅ user comes from validate()
  }

  @Public()
  @Post('send-login-otp')
  async sendLoginOtp(@Body() dto: SendOtpDto, @Ip() ipAddress?: string) {
    return this.authService.sendLoginOtp(dto, ipAddress);
  }
 

  @Public()
  @Post('login-with-otp')
async otpLogin(@Body() dto: VerifyOtpDto) {
  return this.authService.loginWithOtp(dto);
}

@Public()
@Post('forgot-password')
async forgotPassword(@Body() dto: SendOtpDto, @Ip() ipAddress?: string) {
  return this.authService.sendResetPasswordOtp(dto, ipAddress);
}

  
  @Public()
  @Get('by-role/:roleName')
  async getUsersByRole(@Param('roleName') roleName: string) {
 return  this.authService.findUsersByRole(roleName);
    
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Req() req: ExpressRequest) {
    return req.user;
  }

 
}

/*

src/
├── auth/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── permissions.decorator.ts
│   ├── guards/
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   └── auth.module.ts
├── roles/
│   ├── entities/
│   │   ├── role.entity.ts
│   │   ├── permission.entity.ts
│   │   └── role-permission.entity.ts
│   ├── roles.service.ts
│   ├── roles.controller.ts
│   └── roles.module.ts
└── users/
    ├── entities/
    │   └── user.entity.ts
    └── users.module.ts


    */
