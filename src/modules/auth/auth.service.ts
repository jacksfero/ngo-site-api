import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException, Logger,
  ForbiddenException,forwardRef,
  Inject,Scope,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/modules/admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtPayload, RegisterCartUserResponse } from './interfaces/jwt-payload.interface';
import { UserListByRoleNameDto } from '../admin/users/dto/user-list-byrole.dto';

import { RegisterCartUserDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OtpVerification } from 'src/shared/entities/OtpVerification.entity';

import { Role } from 'src/shared/entities/role.entity';
import { OtpService } from 'src/shared/otp/otp.service';
import { ResendOtpDto } from './dto/resend-verification.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { OtpType, UserType, StartEmailVerificationDto, StartMobileVerificationDto } from './dto/start-verification.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { PasswordResetToken } from 'src/shared/entities/password-reset-token.entity';
import { randomBytes } from 'crypto';
 import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
 import { AddressType, UsersAddress } from 'src/shared/entities/users-address.entity';
 import { S3Service } from 'src/shared/s3/s3.service';
import { Product, ProductStatus } from 'src/shared/entities/product.entity';
 import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateWishlistDto } from '../admin/wishlist/dto/create-wishlist.dto';
import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
import { UserProfileImage } from 'src/shared/entities/user-profile-image.entity'; 
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
import { WishlistInventProdDto } from './dto/wishlist-invent-prod-list.dto'; 
import { Cart } from 'src/shared/entities/cart.entity';
 // import { REQUEST } from '@nestjs/core';
  import { Request } from 'express';
import { ResetPassCreatedPayload } from 'src/shared/events/interfaces/event-payload.interface';
import { RequestContextService } from 'src/core/request-context.service';
 

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

   private get context(): RequestContextService {
    return this.moduleRef.get(RequestContextService, { strict: false });
  }

  
  constructor(    
    //  private readonly context: RequestContextService,
        @Inject(forwardRef(() => ModuleRef)) private moduleRef: ModuleRef,
     private readonly eventEmitter: EventEmitter2,
 
 
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly s3service: S3Service,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfileImage)
    private readonly profileImageRepo: Repository<UserProfileImage>,
  
    @InjectRepository(OtpVerification)
    private readonly otpveriRepo: Repository<OtpVerification>,

    @InjectRepository(PasswordResetToken)
    private readonly passresettokenRepo: Repository<PasswordResetToken>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private readonly otpService: OtpService,

    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
  ) { }

  // artist.service.ts
  async getArtistsWithArtworkCount(id: number) {
    const roleId = 4; // ✅ Artist role ID (keep configurable at top)

    const artists = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'roles')
      .innerJoin('user.products', 'product') // user must have product
      .innerJoin('product.productInventory', 'inventory') // product must have inventory
      .where('roles.id = :roleId', { roleId })
      .andWhere('user.artist_type_id = :artistTypeId', { artistTypeId: id })
      .andWhere('user.status = :userstatus', { userstatus: true })
      .andWhere('product.is_active = :productStatus', { productStatus: 'Active' })
      .andWhere('inventory.status = :inventoryStatus', { inventoryStatus: true })
      .select('user.id', 'id')
      .addSelect('user.username', 'username')
      .addSelect('ANY_VALUE(product.defaultImage)', 'defaultImage')
      .addSelect('user.artist_type_id', 'artist_type_id')
      .addSelect('COUNT(product.id)', 'artworkCount') // ✅ count of valid products
      .groupBy('user.id')
      .addGroupBy('user.artist_type_id')
      .addGroupBy('user.username')
      .getRawMany();

    if (artists.length === 0) {
      throw new NotFoundException('No artists found with artworks');
    }

    return artists;
  }


  async getArtistsByUserId(id: number) {
    const roleId = 4; // ✅ Artist role ID (keep configurable at top)
    const artists = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'roles')
      .innerJoinAndSelect('user.profileImage', 'profileImage')
      .innerJoinAndSelect('user.aboutDetails', 'aboutDetails')
     .leftJoinAndSelect('user.addresses', 'address')
      .where('user.id = :id', { id })
      .andWhere('roles.id = :roleId', { roleId }) // ✅ restrict only artists
      // .andWhere('address.type = :type', { type: AddressType.PERSONAL })
      // .where('roles.id = :roleId', { roleId: 4 })
      // .andWhere('user.artist_type_id = :artist_type_id', { artist_type_id: id })
      //.select(['user.id', 'user.username', 'user.artist_type_id'])
      // .orderBy('user.username', 'ASC')
      .getOne();

    if (!artists) {
      throw new NotFoundException('Artists not found');
    }


    // ✅ If roles is an array (common in RBAC systems)
    const isArtist = artists.roles.some((role) => role.id === roleId);

    if (!isArtist) {
      throw new NotFoundException('Artist not found! ');
    }


    return artists;
  }

  async getArtistList(id: number) {
    const artists = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'roles')
      .where('roles.id = :roleId', { roleId: 4 })
      .andWhere('user.status = :status', { status: true })
      .andWhere('user.artist_type_id = :artist_type_id', { artist_type_id: id })
      .andWhere('user.featured_artist = :featured_artist', { featured_artist: true })
      .select(['user.id', 'user.username', 'user.artist_type_id'])
      .orderBy('user.username', 'ASC')
      .getMany();

    if (artists.length === 0) {
      throw new NotFoundException('Artists not found');
    }
    return artists;
  }

  async getArtistListFeatured(id: number) {
    const artists = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'roles')
      .innerJoinAndSelect('user.profileImage', 'profileimg')
      .innerJoinAndSelect('user.addresses', 'address')
      .innerJoinAndSelect('user.aboutDetails', 'about')
      .where('roles.id = :roleId', { roleId: 4 })
      .andWhere('user.status = :status', { status: true })
      .andWhere('user.artist_type_id = :artist_type_id', { artist_type_id: id })
      .andWhere('user.featured_artist = :featured_artist', { featured_artist: true })
      .andWhere('user.homePageDisplay = :homePageDisplay', { homePageDisplay: true })
      .andWhere('address.type = :type', { type: AddressType.PERSONAL })
      .select(['user.id', 'user.username', 'address.city', 'about.awards', 'about.shows', 'about.about', 'address.state', 'address.country', 'profileimg.imageUrl', 'user.artist_type_id'])
      .orderBy('user.username', 'ASC')
      .getMany();

    if (artists.length === 0) {
      throw new NotFoundException('Artists not found');
    }
    return artists;
  }


  async getLoggedInUser(users: any): Promise<User> {
    const userId = users.sub.toString();
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ['profileImage'], // 👈 add relations if you need
  //       select: {
  //   id: true,
  //   username: true,
  //   profileEdit: true,
  // },
  //   });

    const user = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profileImage', 'profileImage')
  .leftJoinAndSelect('user.roles', 'roles')
  .addSelect('user.profileEdit')  // ✅ add extra field
  .where('user.id = :id', { id: userId })
  .getOne();
 
 //    Send welcome email
//   await this.mailService.sendTemplateEmail({
//   to: 'jayprakash005@gmail.com',
//   cc: ['info@indigalleria.com'],
//   //bcc: 'admin@indigalleria.com',
//   subject: 'Welcome to IndiGalleria 🎨',
//   template: 'welcome',
//   context: { name: 'Jay Prakash Jain' },
// })
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserDetailsById(userId): Promise<User> {
    //const userId = users.sub.toString();
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ['profileImage'], // 👈 add relations if you need
  //       select: {
  //   id: true,
  //   username: true,
  //   profileEdit: true,
  // },
  //   });

    const user = await this.userRepository
  .createQueryBuilder('user')
  //.leftJoinAndSelect('user.profileImage', 'profileImage')
  //.addSelect('user.profileEdit')  // ✅ add extra field
  .where('user.id = :id', { id: userId })
  .getOne();
 
 //    Send welcome email
//   await this.mailService.sendTemplateEmail({
//   to: 'jayprakash005@gmail.com',
//   cc: ['info@indigalleria.com'],
//   //bcc: 'admin@indigalleria.com',
//   subject: 'Welcome to IndiGalleria 🎨',
//   template: 'welcome',
//   context: { name: 'Jay Prakash Jain' },
// })
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async uploadProfileImage(profileimage: Express.Multer.File, user: any): Promise<UserProfileImage> {
    let image_Url: string | null = null;
    const userId = user.sub.toString();
    const userd = await this.userRepository.findOne({ where: { id: userId } });
    if (!userd) throw new NotFoundException('User not found');

    if (profileimage) {
      const cleanName = sanitizeFileName(profileimage.originalname);
      const key = `profile/${Date.now()}-${cleanName}`;
      image_Url =
        await this.s3service.uploadBuffer(key, profileimage.buffer, profileimage.mimetype);
    }

    // Check if already exists
    let profileImage = await this.profileImageRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (profileImage) {
      profileImage.imageUrl = image_Url;
    } else {
      profileImage = this.profileImageRepo.create({ imageUrl: image_Url, user: userd });
    }

    return this.profileImageRepo.save(profileImage);
  }
  async geProfileImage(user: any): Promise<UserProfileImage> {
    const userId = user.sub.toString();
    const profileImage = await this.profileImageRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!profileImage) throw new NotFoundException('Profile image not found');
    return profileImage;
  }
  /************ Start registration Process */


  async sendEmailOtp(identifier: string, type: OtpType, userType: UserType, ipAddress?: string) {
    return this.otpService.sendOtp(identifier, type, userType as UserType, ipAddress); // Only identifier and type passed
  }

  async sendMobileOtp(identifier: string, type: OtpType, userType: UserType, ipAddress?: string) {
    return this.otpService.sendOtp(identifier, type, userType as UserType, ipAddress); // Only identifier and type passed
  }


  async resendOtp(dto: ResendOtpDto, ipAddress?: string) {
    return this.otpService.resendOtpByIdentifier(dto, ipAddress);
  }


  async verifyOtp(dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto);
  }


  // src/auth/auth.service.ts

  async registerUser(dto: RegisterUserDto) {
    const { email,isSubscribe,termscondition, mobile, password, username, userType } = dto;


    const existingByEmail = await this.findByEmail(
      email,
    );
    if (existingByEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingByMobile = await this.findByMobile(
      mobile,
    );
    if (existingByMobile) {
      throw new ConflictException('Mobile already registered');
    }

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
       termscondition,
      isSubscribe,
      status: true, is_verified: true,
      password: await bcrypt.hash(password, 10),
      roles: [role], // assign role in array for ManyToMany
    });

    await this.userRepository.save(user);

    return { success: true, message: 'Registration complete', userId: user.id };
  }

  async registerCartUserAndLogin(
    dto: RegisterCartUserDto, guestCartId
  ): Promise<RegisterCartUserResponse> {
    const { identifier, type, otp, userType = UserType.CUSTOMER } = dto;

    // 1️⃣ Verify OTP
    const otpResult = await this.verifyOtp({ identifier, type, otp, userType });
    let user: User | null = otpResult.user ?? null;

    // 2️⃣ Register user if not exist
    if (!user) {
      const role = await this.roleRepository
        .createQueryBuilder('role')
        .where('LOWER(role.name) = LOWER(:name)', { name: userType })
        .getOne();
      if (!role) throw new BadRequestException(`Role '${userType}' not found`);

      const username = identifier; // email or mobile
      user = this.userRepository.create({
        username,
        email: type === OtpType.EMAIL ? identifier : null,
        mobile: type === OtpType.MOBILE ? identifier : null,
        status: true,
        is_verified: true,
        password: null,
        roles: [role],
      } as Partial<User>);
      await this.userRepository.save(user);
    }
console.log('guest ID ---Register--1--------',guestCartId)
//     // 3️⃣ Merge guest cart
    let mergedCart: Cart | undefined;
  if (guestCartId) {
    const guestCart = await this.cartRepo.findOne({
      where: { guestId: guestCartId },
      relations: ['items'], // optional
    });

    if (guestCart) {
      guestCart.user = user;
     // guestCart.guestId = null; // remove guest reference
      mergedCart = await this.cartRepo.save(guestCart); // assign to outer variable
    }
  }

    // 4️⃣ Generate JWT
    const tokenResponse = await this.login(user);

    return {
      success: true,
      message: 'User logged in successfully',
      data: {
        token: tokenResponse.access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email ?? undefined,
          mobile: user.mobile ?? undefined,
        },
       // cart: mergedCart,
      },
    };
  }


  async cartLogin(identifier: string,  ipAddress?: string) {
    if (!identifier) {
      throw new BadRequestException('Email or mobile must be provided.');
    }

    try {
      let user: User | null = null;
      let type: OtpType;
      let userType: UserType;

      // Detect identifier type
      if (this.isValidEmail(identifier)) {
        type = OtpType.EMAIL;     // ✅ enum value
        user = await this.findByEmail(identifier);
      } else if (this.isValidMobile(identifier)) {
        type = OtpType.MOBILE;    // ✅ enum value
        user = await this.findByMobile(identifier);
      } else {
        throw new BadRequestException('Invalid identifier format');
      }
      // ✅ Set userType depending on existence
      if (user) {
        userType = UserType.LOGIN;  
         
        // Existing user
      } else {
        userType = UserType.BUYER;    // New cart user
      }
      // Send OTP
      return await this.otpService.sendOtp(identifier, type, userType, ipAddress);


    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials for cart login');
      }
      throw new BadRequestException('Authentication failed for cart login');
    }
  }

  async ContactSendOTP(identifier: string,  ipAddress?: string) {
    if (!identifier) {
      throw new BadRequestException('Email or mobile must be provided.');
    }
 console.log('----send otp to contact---2222222222---')
    try {
      let user: User | null = null;
      let type: OtpType;
      let userType: UserType; 
      // Detect identifier type
      if (this.isValidEmail(identifier)) {
 
        type = OtpType.EMAIL;     // ✅ enum value
        user = await this.findByEmail(identifier);
         console.log(type,'-----send otp to contact---3333333--',identifier)

      } else if (this.isValidMobile(identifier)) {
        type = OtpType.MOBILE;    // ✅ enum value
        user = await this.findByMobile(identifier);
      } else {
        throw new BadRequestException('Invalid identifier format');
      }
      // ✅ Set userType depending on existence
      // if (user) {
      //   userType = UserType.LOGIN;  
         
      //   // Existing user
      // } else {
      //   userType = UserType.CONTACTUS;    // New cart user
      // }
      userType = UserType.CONTACTUS; 

      // console.log(type,'-----send otp to contact---444444--',identifier,'---',userType)
      // Send OTP
       const jay = await this.otpService.sendOtp(identifier, type, userType, ipAddress);
   //.log(type,'-----send otp to contact---444444--',jay)
  // process.exit();
       return jay;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials for  Contact OTP API ');
      }
      throw new BadRequestException('Authentication failed for Contact OTP API   ');
    }
  }

   async validateUser(loginId: string, password: string): Promise<any> {
    // const { loginId, password } = dto;

    // console.log('loginId-----', loginId, '----password---', password);

    if (!loginId || !password) {
      this.logger.warn('Login attempt with missing credentials');
      throw new BadRequestException('Either email or mobile must be provided.');
    }

    try {
      let user;

      if (this.isValidEmail(loginId)) {
        //  console.log('Detected email login');
        user = await this.findByEmail(loginId);
      } else if (this.isValidMobile(loginId)) {
        //console.log('Detected mobile login');
        user = await this.findByMobile(loginId);
      } else {
        this.logger.warn(`Invalid login format: ${loginId}`);
        throw new BadRequestException(`Invalid login format: ${loginId}`);
      }

      //  console.log('User found:-------------', user);

      if (!user) {
        this.logger.warn(`User not found for loginId: ${loginId}`);
        throw new NotFoundException('Invalid credentials');
      }

      // ✅ CRITICAL: Check if user has a password set
      if (!user.password) {
        this.logger.warn(`User ${user.id} has no password set-- ${user}`);
        throw new UnauthorizedException('Account not properly set up. Please reset your password.');
      }
      // console.log('user--------',user)
      // ✅ Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user: ${user.id} - user data- ${user}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      return result;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw new BadRequestException('Authentication failed');
    }
  }

  private isValidEmail(input: string): boolean {
    return input?.includes('@') && input.length > 5;
  }

  private isValidMobile(input: string): boolean {
    // Basic mobile number validation - adjust for your needs
    return /^\d{10,15}$/.test(input);
  } 


  async login(user: User, req?: Request) {
  if (!user) {
    this.logger?.warn?.('Login failed: user is undefined');
    throw new UnauthorizedException('Invalid login request');
  }
 const request = req ?? this.context?.getRequest?.();
const guestCartId = request?.cookies?.['guestCartId'];// ✅ Safe access with optional chaining
  //const guestCartId = null;
//console.log('guest ID ---Login--1--------',guestCartId)

  let mergedCart: Cart | undefined;
  if (guestCartId) {
    const guestCart = await this.cartRepo.findOne({
      where: { guestId: guestCartId },
      relations: ['items', 'items.product'],
    });
//console.log('guest ID -----2--------',guestCartId)
    if (guestCart) {
      guestCart.user = user;
      mergedCart = await this.cartRepo.save(guestCart);

      this.logger?.log?.(
        `Guest cart ${guestCartId} merged into user ${user.id}'s cart.`,
      );
    }
  }

  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    roles: user.roles?.map((r) => r.name),
  };

  return {
    access_token: this.jwtService.sign(payload),
    ...(mergedCart ? { cart: mergedCart } : {}),
  };
}

  async sendResetPasswordOtp(dto: SendOtpDto, ipAddress?: string) {
    // const { identifier, type, userType  } = dto;
    const { identifier, type, userType } = dto;
    // console.log('===========',userType);
    return this.otpService.sendOtp(identifier, type, UserType.FORGOT_PASSWORD, ipAddress);
    // return this.otpService.sendOtp(identifier,type,userType as UserType, ipAddress);
  }

  async verifyForgotPasswordOtp(dto: VerifyOtpDto, ipAddress?: string) {

    const result = await this.otpService.verifyOtp({ ...dto, userType: UserType.FORGOT_PASSWORD });

    // const result = await this.verifyOtp(identifier, otp, UserType.FORGOT_PASSWORD);
    if (!result.success || !result.user) {
      throw new BadRequestException(result.message);
    }

    // Generate short-lived reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.passresettokenRepo.save({
      userId: result.user.id,
      token,
      expiresAt,
    });

    return { resetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { resetToken, password } = dto;
    const record = await this.passresettokenRepo.findOne({
      where: { token: resetToken },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { id: record.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(password, 10);
    await this.userRepository.save(user);

    // Remove token after use
    await this.passresettokenRepo.delete(record.id);
   // console.log('Name-----', user.username,'---Email-------', user.email)
    /** Start Mail Service */
     const payload: ResetPassCreatedPayload = {
        context: {},
        name: user.username,
        to: user.email,
};

this.eventEmitter.emit('reset_password.send', payload);       
/** End Mail Service */
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const { oldPassword, password: newPassword } = dto;
    // 1. Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Ensure the user has a password set
    /* if (!user.password) {
      throw new BadRequestException(
        'This account does not have a password set. Please use OTP login or set a password first.',
      );
    }
  
     // 2. Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Old password is incorrect');
      }
  */
    // 3. Prevent reusing the same password
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password cannot be the same as old password',
        );
      }
    }

    // 4. Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }


  async sendLoginOtp(dto: SendOtpDto, ipAddress?: string) {
    const { identifier, type, userType } = dto;
    // console.log('===========',userType);
    return this.otpService.sendOtp(identifier, type, userType as UserType, ipAddress);
  }


  async loginWithOtp(dto: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp({ ...dto, userType: UserType.LOGIN });

    if (!result.success || !result.user) {
      throw new UnauthorizedException('Invalid OTP or user not found');
    }
   // console.log('-----result--------',result)

    return this.login(result.user );
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email }, relations: ['roles', 'roles.permissions'],
      select: ['id', 'email', 'password', 'mobile', 'is_verified', 'username']
    });
  }

  async findByMobile(mobile: string) {
    return this.userRepository.findOne({
      where: { mobile }, relations: ['roles', 'roles.permissions'],
      select: ['id', 'email', 'password', 'mobile', 'is_verified', 'username']
    });
  }

  async findUsersByRole(roleNames: string[]): Promise<UserListByRoleNameDto[]> {
    const users = await this.usersService.findUsersByRole(roleNames);
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found for the specified role');
    }
    return users;
  }
  
  /**************Start Wish List Services Method********* */
  async addToWishlist(
    user: any,
    dto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const userId = user.sub.toString()
    //  console.log('user id ----------', userId)
    const product = await this.productRepository.findOneBy({
      id: dto.productId,
    });

    if (!product) throw new NotFoundException('Product not found');

    // ✅ Check if product already in wishlist
    const existing = await this.wishlistRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: dto.productId },
      },
    });

    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    // ✅ Create wishlist with user ID and product ID (not full objects)
    const wishlist = this.wishlistRepository.create({
      user: { id: userId }, // ✅ Pass only user ID
      product: { id: dto.productId } // ✅ Pass only product ID
    });

    return this.wishlistRepository.save(wishlist);
  }
  async getUserWishlistsssssss(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }
  async getUserWishlist(
    paginationDto: PaginationBaseDto,
    userId: number,
  ): Promise<PaginationResponseDto<WishlistInventProdDto>> {
    const { page = 1, limit = 10 } = paginationDto;

    const qb = this.wishlistRepository.createQueryBuilder('wishlist')
      // product must exist (use inner join)
      .innerJoinAndSelect('wishlist.product', 'product')
      // inventory must exist and be available -> inner join is OK because 1:1
      .innerJoinAndSelect('product.productInventory', 'inventory')
      // other product relations (optional)
      .leftJoinAndSelect('product.artist', 'artist')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.surface', 'surface')
      .leftJoinAndSelect('product.medium', 'medium')
      .leftJoinAndSelect('inventory.shippingWeight', 'shipping')

      // filters
      .where('wishlist.user_id = :userId', { userId })
      .andWhere('product.is_active = :isActive', { isActive: ProductStatus.ACTIVE })
      .andWhere('inventory.status = :invStatus', { invStatus: true })

      // pagination
      .skip((page - 1) * limit)
      .take(limit);

    // Explicit select (helps reduce payload)
    qb.select([
      // wishlist
      'wishlist.id',
      'wishlist.createdAt',
      'product.id',
      'product.productTitle',
      'product.slug',
      'product.defaultImage',
      'product.price_on_demand',
      'product.weight',
      'product.width',
      'product.height',
      'product.depth',
      'product.is_active',

      // category/artist/surface/medium minimal fields
      'category.id',
      'category.name',
      'artist.id',
      'artist.username',
      'surface.id',
      'surface.surfaceName',
      'medium.id',
      'medium.name',

      // inventory fields
      'inventory.id',
      //'inventory.product_id', // if your inventory column name is product_id; use correct name
      'inventory.price',
      'inventory.discount',
      'inventory.gstSlot',
      'inventory.shippingSlot',
      'inventory.status',
      'inventory.updatedAt',

      // shipping
      'shipping.weightSlot',
      'shipping.costINR',
      'shipping.CostOthers',
    ]);

    const [result, total] = await qb.getManyAndCount();

    // transform to DTOs
    const data = plainToInstance(WishlistInventProdDto, result, {
      excludeExtraneousValues: true,
    });

    return new PaginationResponseDto<WishlistInventProdDto>(data, {
      total,
      page,
      limit,
    });
  }



  async removeWishList(id: number): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) throw new NotFoundException(`wishlist ${id} not found`);
    await this.wishlistRepository.remove(wishlist);
  }
  /**************End Wish List Services Method********* */
}
 
 
