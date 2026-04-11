import { Request as ExpressRequest } from 'express';
import {
  Controller,
  Get,
  Request as Req,
  UseGuards, Res,
  Post,
  Body, Optional, Inject,
  Patch,
  Param,
  Delete,
  Ip,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  ParseEnumPipe, Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/core/decorators/public.decorator';
import { PublicGuard } from 'src/core/guards/public.guard';
import { RegisterCartUserDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { OtpType, StartEmailVerificationDto, UserType, StartMobileVerificationDto } from './dto/start-verification.dto';
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
 
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
 
import { FRONT_WISHLIST_INVENT_PRODUCTS_LIMIT, FRONT_WISHLIST_INVENT_PRODUCTS_MAX_LIMIT, FRONT_WISHLIST_INVENT_PRODUCTS_PAGE, PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE } from 'src/shared/config/pagination.config';
 
import { CreateKycDetailDto, UpdateKycDetailDto } from '../admin/users/dto/create-user-kyc-detail.dto';
import { CreateBankDetailDto } from '../admin/users/dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from '../admin/users/dto/update-user-bank-detail.dto';
import { FileValidationPipe } from 'src/shared/pipes/file-size-type-validation.pipe';
import { AddressType } from 'src/shared/entities/users-address.entity';
import { PaginationClinetPipe } from 'src/shared/pipes/pagination-client.pipe';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
 
import { User } from 'src/shared/entities/user.entity';
import { RequirePermissions } from './decorators/permissions.decorator';
import { AuthUserAddressService } from './auth-user-address.service';
import { AuthUserProductService } from './auth-user-product.service';
//import { LocalStrategy } from './strategies/local.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private authUserAddressService: AuthUserAddressService,

    private authUserProductService: AuthUserProductService,

    // @Optional() @Inject(LocalStrategy) private localStrategy?: LocalStrategy
  ) {
    // console.log('🔧 AuthController - LocalStrategy injected:', !!localStrategy);
  }



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
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }

    const result = await this.authService.login(req.user as User, req); // ✅ pass req

    // clear guestCartId cookie if exists
    // if (req.cookies?.['guestCartId']) {
    //   res.clearCookie('guestCartId', { httpOnly: true, sameSite: 'lax' });
    // }
    // 🔐 ADD COOKIE (non-breaking)
    // console.log(`process.env.NODE_ENV-------`, process.env.NODE_ENV)
    // console.log(`process.env.COOKIE_DOMAIN-------`, process.env.COOKIE_DOMAIN)
    // console.log(`process.token-------`, result.access_token)
    // console.log(`process.result-------`, result)
  //  const isDev = process.env.NODE_ENV !== 'production';
  const origin = req.headers.origin;
const isLocalhost = origin?.includes('localhost');
    if (result?.access_token) {
    res.cookie('access_token', result.access_token, {
  httpOnly: true,
  secure: true, // Required for sameSite: 'none'
  sameSite: 'none',
  // ⬇️ IF LOCALHOST, DOMAIN MUST BE UNDEFINED
  domain: process.env.NODE_ENV === 'development' ? undefined : '.onrender.com',
  path: '/',
});
    }
 
    // clear guest cart
    if (req.cookies?.['guestCartId']) {
      res.clearCookie('guestCartId', {
        httpOnly: true,
        secure: true,          // Use false for localhost HTTP
        sameSite: 'none',
        path: '/',
        domain: process.env.COOKIE_DOMAIN, // ✅ REQUIRED
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }
    return result;
  }

  @Public()
  @Post('send-login-otp')
  async sendLoginOtp(@Body() dto: SendOtpDto, @Ip() ipAddress?: string) {
    return this.authService.sendLoginOtp(dto, ipAddress);
  }


@Public()
@Post('login-with-otp')
async otpLogin(
  @Body() dto: VerifyOtpDto,
  @Req() req: ExpressRequest,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.loginWithOtp(dto);

  if (!result?.access_token) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  // clear guest cart
  if (req.cookies?.['guestCartId']) {
    res.clearCookie('guestCartId', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: process.env.COOKIE_DOMAIN,
    });
  }

  return result;
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


  // @Public()
  // @Post('logout')
  // async logout(@Res({ passthrough: true }) res: Response) {
  //   // Clear JWT token (if stored as cookie)
  //   res.clearCookie('access_token', {
  //     httpOnly: true,secure: true, path: "/",
  //     sameSite: 'none',
  //   });

  //   // Clear guest cart cookie
  //   res.clearCookie('guestCartId', {
  //     httpOnly: true,secure: true, path: "/",
  //     sameSite: 'none',
  //   });

  //   return { message: 'Logged out successfully' };
  // }
  @Public()
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authHeader: string
  ) {
    // Clear JWT token cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true, // Use secure only in production
      path: '/',
      sameSite: 'none', // 'lax' is better for most cases
       domain: process.env.COOKIE_DOMAIN,
    });



    // Clear guest cart cookie
    res.clearCookie('guestCartId', {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'none',
      domain: process.env.COOKIE_DOMAIN,
    });



    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }


  @Public()
  @Post('send-otp-cart')
  async sendOtpCart(@Body('identifier') identifier: string,
    @Req() req: ExpressRequest,

  ) {
    let guestId = req.cookies?.['guestCartId'];
    // Extract IP if you want to track OTP abuse attempts
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || undefined;
    return await this.authService.cartLogin(identifier, ipAddress);
  }

  @Public()
  @Post('send-otp-contact')
  async sendOtpContact(@Body('identifier') identifier: string,
    @Req() req: ExpressRequest,
  ) {
    //  console.log('----send otp to contact------')
    //let guestId = req.cookies?.['guestCartId'];
    // Extract IP if you want to track OTP abuse attempts
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || undefined;
    return await this.authService.ContactSendOTP(identifier, ipAddress);
  }


  // @Public()
  // @Post('register-cart-login')
  // async registerCartUserAndLogin(
  //   @Body() dto: RegisterCartUserDto,
  //   @Req() req,
  //   @Res({ passthrough: true }) res: Response,

  // ) {
  //   let guestId = req.cookies?.['guestCartId'];

  //  // console.log('guestId---------', guestId);
  //   const result = await this.authService.registerCartUserAndLogin(dto, guestId);



  //  // 1. Correct the check path
  // if (!result?.data?.token) {
  //   throw new UnauthorizedException('Invalid or expired OTP');
  // }

//  res.cookie('access_token', result.data.token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: 'none',
//     path: '/',
//     domain: process.env.COOKIE_DOMAIN,
//     maxAge: 1000 * 60 * 60 * 24 * 30,
//   });

//   // clear guest cart
//   if (req.cookies?.['guestCartId']) {
//     res.clearCookie('guestCartId', {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       path: '/',
//       domain: process.env.COOKIE_DOMAIN,
//     });
//   }


// return result;

//   }


/*
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
  }*/

    @Public()
  @Get('artistslistfeaturedhome')
  async getArtistListFeaturedHome(     
  ) {
    return this.authService.getArtistListFeaturedHome();
  }

  @Public()
  @Get('by-role/')
  async getUsersByRole(
    @Query('roles') roles: string,

  ) {
    const roleList = roles.split(',').map(r => r.trim());
    return this.authService.findUsersByRole(roleList);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMe(@Req() req) {
    return this.authService.getLoggedInUser(req.user);
  }

  /** Start User about us section */
  @UseGuards(AuthGuard('jwt'))
  @Post('about')
  createUserAbout(@Body() dto: CreateUsersAboutDto, @Req() req) {

    return this.authUserAddressService.createUserAbout(dto, req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('about')
  findOneUserAbout(@Req() req) {
    return this.authUserAddressService.findOneAboutByUserId(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('about')
  updateAbout(@Body() dto: UpdateUsersAboutDto, @Req() req) {
    // console.log('update JWT User:', req.user);  // <--- check if user is set
    //console.log('update Body:', dto);
    return this.authUserAddressService.updateAbout(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('profileimage'))
  uploadProfileImage(
    @UploadedFile(new FileValidationPipe(2 * 1024 * 1024)) file: Express.Multer.File,
    @Req() req
  ) {
    return this.authService.uploadProfileImage(file, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profileimage')
  geProfileImage(@Req() req) {
    return this.authService.geProfileImage(req.user);
  }

  /*************User address Section */
  @UseGuards(JwtAuthGuard)
  @Post('user-kyc')
  createkycDetail(@Body() dto: CreateKycDetailDto, @Req() req) {
    //  console.log('JWT User:', req.user);  // <--- check if user is set
    // console.log('Body:', dto);
    return this.authUserAddressService.createkycDetail(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-kyc')
  findAllKyc(@Req() req) {
    return this.authUserAddressService.findAllKyc(req.user.sub.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user-kyc')
  updatekyc(@Body() dto: UpdateKycDetailDto, @Req() req) {
    // console.log('update JWT User:', req.user);  // <--- check if user is set
    // console.log('update Body:', dto);
    return this.authUserAddressService.updatekyc(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user-bank')
  createBankDetail(@Body() dto: CreateBankDetailDto, @Req() req) {
    // console.log('JWT User:', req.user);  // <--- check if user is set
    // console.log('Body:', dto);
    return this.authUserAddressService.createBankDetail(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-bank')
  findAllBank(@Req() req) {
    return this.authUserAddressService.findAllBank(req.user.sub.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user-bank')
  updateBank(@Body() dto: UpdateBankDetailDto, @Req() req) {
    // console.log('update JWT User:', req.user);  // <--- check if user is set
    // console.log('update Body:', dto);
    return this.authUserAddressService.updateBank(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user-address')
  createAddress(@Body() dto: CreateUserAddressDto, @Req() req) {
    // console.log('JWT User:', req.user);  // <--- check if user is set
    // console.log('Body:', dto);
    return this.authUserAddressService.createAddress(dto, req.user);
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

    return this.authUserAddressService.findAllForUserAddress(addressType, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-address/:id')
  findOneAddress(@Param('id') id: number, @Req() req) {
    // console.log('update JWT User:', req.user);  // <--- check if user is set
    // console.log('update Body:', dto);
    return this.authUserAddressService.findOneAddress(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user-address/:id')
  updateAddress(@Param('id') id: number, @Body() dto: UpdateUserAddressDto, @Req() req) {
    // console.log('update JWT User:', req.user);  // <--- check if user is set
    // console.log('update Body:', dto);
    return this.authUserAddressService.updateAddress(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user-address/:id')
  remove(@Param('id') id: number, @Req() req) {
    return this.authUserAddressService.removeAddress(id, req.user);
  }
  /*************End    User address Section */


  /*************Start User Product Section */
 /* @UseGuards(JwtAuthGuard)
  @Post('products')
  @RequirePermissions('create_artwork')
  @UseInterceptors(FileInterceptor('defaultImage'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    // const imagePath = file?.filename;
    return this.authUserProductService.createProduct(createProductDto, req.user, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products')
  @RequirePermissions('read_artwork')
  async findAll(
    @Query(new PaginationClinetPipe(PRODUCTS_LIMIT, PRODUCTS_MAX_LIMIT, PRODUCTS_PAGE))
    @Query() paginationDto: ProductPaginationDto,
    @Req() req,
  ): Promise<PaginationResponseDto<ProductDto>> {
    return this.authUserProductService.findAllProducts(paginationDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  @RequirePermissions('read_artwork')
  findOneProduct(@Param('id') id: string) {
    return this.authUserProductService.findOneProduct(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('products/:id')
  @RequirePermissions('update_artwork')
  @UseInterceptors(FileInterceptor('defaultImage'))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File

  ) {
    const imagePath = file?.filename;
    return this.authUserProductService.updateProduct(id, dto, req.user, file ?? null);
  }

  @Post('products/:product_id/upload-image')
  @RequirePermissions('update_artwork')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('product_id', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.authUserProductService.addImageProduct(productId, file);
  }

  @Patch('products/image/:image_id/alt-text')
  @RequirePermissions('update_artwork')
  async updateImageAltText(
    @Param('image_id', ParseIntPipe) imageId: number,
    @Body('alt_text') altText: string,
  ) {
    if (!altText) {
      throw new BadRequestException('alt_text is required');
    }
    return this.authUserProductService.updateImageAltText(imageId, altText);
  }

  @Delete('products/delete-image/:imageId')
  @RequirePermissions('delete_artwork')
  async deleteImage(@Param('imageId') imageId: number) {
    return this.authUserProductService.deleteProductImage(imageId);
  }*/


  /*************End User address Section */
  /*************Start User WishList Section */
 /* @UseGuards(JwtAuthGuard)
  @Post('wishlist')
  createsWishList(
    @Req() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {

    return this.authService.addToWishlist(req.user, createWishlistDto);
  }



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
  }*/
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
