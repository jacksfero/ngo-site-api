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
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';


import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/decorators/public.decorator';
import { PublicGuard } from 'src/core/guards/public.guard';

import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { OtpType, StartEmailVerificationDto, StartMobileVerificationDto } from './dto/start-verification.dto';
import { ResendOtpDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login.dto';
//import { OtpLoginDto } from './dto/otp-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { CreateUsersAboutDto, UpdateUsersAboutDto } from './dto/create-users-about.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from '../admin/product/dto/create-product.dto';
import { PaginationPipe } from 'src/shared/pipes/pagination.pipe';
import { ProductPaginationDto } from '../admin/product/dto/product-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from '../admin/product/dto/product.dto';
import { FRONT_WISHLIST_INVENT_PRODUCTS_LIMIT, FRONT_WISHLIST_INVENT_PRODUCTS_MAX_LIMIT, FRONT_WISHLIST_INVENT_PRODUCTS_PAGE, PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
import { UpdateProductDto } from '../admin/product/dto/update-product.dto';
import { CreateWishlistDto } from '../admin/wishlist/dto/create-wishlist.dto';
import { CreateKycDetailDto,UpdateKycDetailDto } from '../admin/users/dto/create-user-kyc-detail.dto';
import { CreateBankDetailDto } from '../admin/users/dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from '../admin/users/dto/update-user-bank-detail.dto';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';
import { AddressType } from 'src/shared/entities/users-address.entity';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
import { WishlistInventProdDto } from './dto/wishlist-invent-prod-list.dto';
 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
     * Step 1: Start Registration - Send OTP
     * POST /auth/start-registration
     */


  
  @Public()
  @Post('start-email-verification')
  startEmail(@Body() dto: StartEmailVerificationDto, @Req() req: ExpressRequest) {
    const ipAddress = req.ip;
    return this.authService.sendEmailOtp(dto.email, OtpType.EMAIL, dto.userType, ipAddress);
  }
 
  @Public()
  @Post('start-mobile-verification')
  startMobile(@Body() dto: StartMobileVerificationDto, @Req() req: ExpressRequest) {
    const ipAddress = req.ip;
    return this.authService.sendMobileOtp(dto.mobile, OtpType.MOBILE, dto.userType, ipAddress);
  }

  @Public()
  @Post('resend-verification')
  resendOtp(@Body() dto: ResendOtpDto, @Req() req: ExpressRequest) {
    // const ipAddress = req.ip;
    const ipAddress = req.ip;
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


   // @UseGuards(AuthGuard('local'))  
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
  @Post('verify-otp-forgot-password')
  async verifyForgotPasswordOtp(@Body() dto: VerifyOtpDto, @Ip() ipAddress?: string) {
    return this.authService.verifyForgotPasswordOtp(dto, ipAddress);
  }

  
  
  @Public()
   @Post('reset-password')
async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto);
}

 @UseGuards(JwtAuthGuard)
@Post('change-password')
async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
  return this.authService.changePassword(req.user.sub.toString(), dto);
}


 @UseGuards(JwtAuthGuard)
 @Post('logout')
 async logout(@Req() req) {
  localStorage.removeItem('token'); // clear JWT
//  res.clearCookie('access_token');
 // navigate('/login');
   return { message: 'Logged out successfully.  ' };
 }


  @Public()
  @Get('artistsartwork/:id')
  async getArtistsByUserId(
    @Param('id') id: number,
  ) {
    return this.authService.getArtistsByUserId(id);
  }


  @Public()
  @Get('artistslistartwork/:id')
  async getArtistsWithArtworkCount(
    @Param('id') id: number,
  ) {
    return this.authService.getArtistsWithArtworkCount(id);
  }

  @Public()
  @Get('artistslist/:id')
  async getArtistList(
    @Param('id') id: number,
  ) {
    return this.authService.getArtistList(id);
  }

  @Public()
  @Get('artistslistfeatured/:id')
  async getArtistListFeatured(
    @Param('id') id: number,
  ) {
    return this.authService.getArtistListFeatured(id);
  }
 
  @Public()
  @Get('by-role/:roleName')
  async getUsersByRole(@Param('roleName') roleName: string) {
    return this.authService.findUsersByRole(roleName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMe(@Req() req) {
    return this.authService.getLoggedInUser(req.user);
  }

/** Start User about us section */
@UseGuards(AuthGuard('jwt'))
@Post('about')
createUserAbout( @Body() dto: CreateUsersAboutDto, @Req() req) {
  return this.authService.createUserAbout(dto, req.user);
}
@UseGuards(JwtAuthGuard)
@Get('about')
findOneUserAbout(@Req() req) {
  return this.authService.findOneAboutByUserId(req.user);
}
@UseGuards(JwtAuthGuard)
@Patch('about')
updateAbout(@Body() dto: UpdateUsersAboutDto, @Req() req) {
 // console.log('update JWT User:', req.user);  // <--- check if user is set
  //console.log('update Body:', dto);
  return this.authService.updateAbout(dto,req.user);
}

@UseGuards(JwtAuthGuard)
@Post('upload')
@UseInterceptors(FileInterceptor('profileimage'))
uploadProfileImage(
  @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
   @Req() req
) {
  return this.authService.uploadProfileImage(file,req.user);
}

@UseGuards(JwtAuthGuard)
@Get('profileimage')
  geProfileImage(@Req() req) {
    return this.authService.geProfileImage(req.user);
  }

/*************User address Section */
@UseGuards(JwtAuthGuard)
@Post('user-kyc')
createkycDetail(@Body() dto: CreateKycDetailDto,@Req() req) {
  console.log('JWT User:', req.user);  // <--- check if user is set
  console.log('Body:', dto);
  return this.authService.createkycDetail(dto, req.user);
}

@UseGuards(JwtAuthGuard)
@Get('user-kyc')
findAllKyc(@Req() req) {
  return this.authService.findAllKyc(req.user.sub.toString());
}

@UseGuards(JwtAuthGuard)
@Patch('user-kyc')
updatekyc( @Body() dto: UpdateKycDetailDto, @Req() req) {
  // console.log('update JWT User:', req.user);  // <--- check if user is set
  // console.log('update Body:', dto);
  return this.authService.updatekyc(dto,req.user);
}

@UseGuards(JwtAuthGuard)
@Post('user-bank')
createBankDetail(@Body() dto: CreateBankDetailDto,@Req() req) {
  console.log('JWT User:', req.user);  // <--- check if user is set
  console.log('Body:', dto);
  return this.authService.createBankDetail(dto, req.user);
}

@UseGuards(JwtAuthGuard)
@Get('user-bank')
findAllBank(@Req() req) {
  return this.authService.findAllBank(req.user.sub.toString());
}

@UseGuards(JwtAuthGuard)
@Patch('user-bank')
updateBank( @Body() dto: UpdateBankDetailDto, @Req() req) {
  // console.log('update JWT User:', req.user);  // <--- check if user is set
  // console.log('update Body:', dto);
  return this.authService.updateBank(dto,req.user);
}

@UseGuards(JwtAuthGuard)
@Post('user-address')
createAddress(@Body() dto: CreateUserAddressDto,@Req() req) {
 // console.log('JWT User:', req.user);  // <--- check if user is set
 // console.log('Body:', dto);
  return this.authService.createAddress(dto, req.user);
}

  @UseGuards(JwtAuthGuard)
  @Get('user-address/:addressType')
  findAllAddress(
    @Param('addressType', new ParseEnumPipe(AddressType)) addressType: AddressType,
    @Req() req
  ) {
   // console.log('✅ Controller reached');
  //  console.log('AddressType:', addressType);
  //  console.log('JWT User:', req.user);
    
    return this.authService.findAllForUserAddress(addressType, req.user);
  }
 
@UseGuards(JwtAuthGuard)
@Patch('user-address/:id')
updateAddress(@Param('id') id: number,  @Body() dto: UpdateUserAddressDto, @Req() req) {
 // console.log('update JWT User:', req.user);  // <--- check if user is set
 // console.log('update Body:', dto);
  return this.authService.updateAddress(id,dto,req.user);
}

@UseGuards(JwtAuthGuard)
@Delete('user-address/:id')
remove( @Param('id') id: number, @Req() req) {
  return this.authService.removeAddress(id,req.user);
}
/*************End    User address Section */


/*************Start User Product Section */
@UseGuards(JwtAuthGuard)
@Post('products') 
@UseInterceptors(FileInterceptor('defaultImage'))
create(
  @Body() createProductDto: CreateProductDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req,
) {
 // const imagePath = file?.filename;
  return this.authService.createProduct(createProductDto, req.user, file);
}

@UseGuards(JwtAuthGuard)
@Get('products')
  async findAll(
    @Query(new PaginationPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    @Query() paginationDto: ProductPaginationDto,
    @Req() req,
  ): Promise<PaginationResponseDto<ProductDto>> {
    return this.authService.findAllProducts(paginationDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  findOneProduct(@Param('id') id: string) {
    return this.authService.findOneProduct(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('products/:id')
  @UseInterceptors(FileInterceptor('defaultImage'))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
    
  ) {
    const imagePath = file?.filename;
    return this.authService.updateProduct(id, dto,req.user, file ?? null );
  }

  @Post('products/:product_id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('product_id', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.authService.addImageProduct(productId, file);
  }

  @Patch('products/image/:image_id/alt-text')
  async updateImageAltText(
    @Param('image_id', ParseIntPipe) imageId: number,
    @Body('alt_text') altText: string,
  ) {
    if (!altText) {
      throw new BadRequestException('alt_text is required');
    }
    return this.authService.updateImageAltText(imageId, altText);
  }
  
  @Delete('products/delete-image/:imageId')
  async deleteImage(@Param('imageId') imageId: number) {
    return this.authService.deleteProductImage(imageId);
  }



  
/*************End User address Section */
/*************Start User WishList Section */
@UseGuards(JwtAuthGuard)
@Post('wishlist')
  createsWishList(
    @Req() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
 
    return this.authService.addToWishlist(req.user, createWishlistDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('wishlist')
  // findAllWishList( @Req() req) {
  //   //  return this.globalVar;
  //   //console.log('---glooooo------' + this.globalVar);
  //   return this.authService.getUserWishlist(req.user.sub.toString());
  // }

  @UseGuards(JwtAuthGuard)
  @Get('wishlist')
  async findAllWishList(
    @Query(new PaginationClinetPipe(
      FRONT_WISHLIST_INVENT_PRODUCTS_LIMIT,
      FRONT_WISHLIST_INVENT_PRODUCTS_MAX_LIMIT,
      FRONT_WISHLIST_INVENT_PRODUCTS_PAGE,
    ))
    @Query() paginationDto: PaginationBaseDto,
    @Req() req,
  ): Promise<PaginationResponseDto<WishlistInventProdDto>> {
    return this.authService.getUserWishlist(paginationDto, Number(req.user.sub));
  }

  @Delete('wishlist/:id')
  removeWishList(@Param('id') id: string) {
    return this.authService.removeWishList(+id);
  }
/*************End User WishList Section */
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
