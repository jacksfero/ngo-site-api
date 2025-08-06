import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/admin/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpVerification } from 'src/shared/entities/OtpVerification.entity';
import { User } from 'src/shared/entities/user.entity';
import { Role } from 'src/shared/entities/role.entity';
import { OtpModule } from 'src/shared/otp/otp.module';
 
@Module({
  imports: [TypeOrmModule.forFeature([User,Role,OtpVerification]),
    UsersModule,
    OtpModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [LocalStrategy,
    AuthService,
    
    JwtStrategy,
    JwtAuthGuard,      // 👈 Add
    RolesGuard,        // 👈 Add
    PermissionsGuard,  // 👈 Add
  ],
  exports: [
    JwtAuthGuard,      // 👈 Export
    RolesGuard,        // 👈 Export
    PermissionsGuard,  // 👈 Export
  ],
})
export class AuthModule {}


/*

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('USER')
@Permissions('can_place_order')
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}


@ClientAuth(['USER'], ['can_place_order']) // internally wraps guards
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}

import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('client/profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER) // Or whatever role your user has
  @Get()
  getProfile(@Req() req) {
    return req.user;
  }
}
*/