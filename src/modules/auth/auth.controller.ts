import {
  Controller,
  Get,Req,
   Request,
  UseGuards,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
//import { Request } from 'express';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from 'src/modules/admin/users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/decorators/public.decorator';
import { PublicGuard } from 'src/core/guards/public.guard';
import { StartRegistrationDto } from './dto/start-registration.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteRegistrationDto } from './dto/ complete-registration.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


 
/**
   * Step 1: Start Registration - Send OTP
   * POST /auth/start-registration
   */
  @Public()
  @Post('start-registration')
  async startRegistration(
    @Body() dto: StartRegistrationDto,
    //@Req() req: Request
  ) {
   // const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authService.startRegistration(dto);
  }

@Public()
@Post('verify-otp')
verifyOtp(@Body() dto: VerifyOtpDto) {
  return this.authService.verifyOtp(dto);
}

@Public()
@Post('complete-registration')
async complete(@Body() dto: CompleteRegistrationDto) {
  return this.authService.completeRegistration(dto);
}


 
 //@UseGuards(PublicGuard)
  @Public()
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  
    
  @Public()
  //  @UseGuards(AuthGuard('local'))
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user); // user is attached by LocalStrategy
  }
 
  

  @Public()
  @Get('by-role/:roleName')
  async getUsersByRole(@Param('roleName') roleName: string) {
 return  this.authService.findUsersByRole(roleName);
    
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
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
