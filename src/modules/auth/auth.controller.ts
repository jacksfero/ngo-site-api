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

import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from 'src/modules/admin/users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/decorators/public.decorator';
import { PublicGuard } from 'src/core/guards/public.guard';
 
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { StartEmailVerificationDto,StartMobileVerificationDto } from './dto/start-verification.dto';
import { ResendOtpDto } from './dto/resend-verification.dto';
import { LoginDto } from './login.dto';
import { OtpLoginDto } from './dto/otp-login.dto';
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
  return this.authService.sendEmailOtp(dto,ipAddress);
}

// @Public()
// @Post('resend-email-verification')
// resendEmail(@Body() dto: StartEmailVerificationDto) {
//   return this.authService.resendEmailOtp(dto.email);
// }

@Public()
@Post('start-mobile-verification')
startMobile(@Body() dto: StartMobileVerificationDto, @Req() req: ExpressRequest) {
  const ipAddress = req.ip  ;
  return this.authService.sendMobileOtp(dto,ipAddress);
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


 
  @Public()
  //  @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(dto: LoginDto) {
    return this.authService.login(dto); // user is attached by LocalStrategy
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
