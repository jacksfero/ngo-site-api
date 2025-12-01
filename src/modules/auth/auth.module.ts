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
import { PasswordResetToken } from 'src/shared/entities/password-reset-token.entity';
import { UsersAbout } from 'src/shared/entities/users-about.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { Product } from 'src/shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { BankDetail } from 'src/shared/entities/user-bank-detail.entity';
import { KycDetails } from 'src/shared/entities/user-kyc.entity';
import { UserProfileImage } from 'src/shared/entities/user-profile-image.entity';
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';
import { Cart } from 'src/shared/entities/cart.entity';
import { AuthUserAddressService } from './auth-user-address.service';
import { AuthUserProductService } from './auth-user-product.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, OtpVerification, PasswordResetToken,
    UsersAbout, UsersAddress, BankDetail, KycDetails, Product, ProductImage, Surface, Medium,
    Subject, Style, Productcategory, Wishlist, UserProfileImage, Cart,
    
  ]),
    UsersModule,
    OtpModule,
  PassportModule.register({ defaultStrategy: 'local' }), // ✅ Fixed
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
  providers: [
    AuthService,LocalStrategy, AuthUserAddressService, AuthUserProductService,  
    JwtStrategy,
   // LocalAuthGuard,
    JwtAuthGuard,      // 👈 Add
    RolesGuard,        // 👈 Add
    PermissionsGuard,  // 👈 Add
  ],
  exports: [
    JwtAuthGuard,      // 👈 Export
    RolesGuard,        // 👈 Export
    PermissionsGuard,  // 👈 Export
    AuthService,PassportModule
  ],
})
export class AuthModule { }

