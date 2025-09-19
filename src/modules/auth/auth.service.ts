import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException, Logger,
  ForbiddenException,
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
import { OtpType, UserType, StartEmailVerificationDto, StartMobileVerificationDto } from './dto/start-verification.dto';

import { SendOtpDto } from './dto/send-otp.dto';
import { PasswordResetToken } from 'src/shared/entities/password-reset-token.entity';
import { randomBytes } from 'crypto';
import { UsersAbout } from 'src/shared/entities/users-about.entity';
import { CreateUsersAboutDto, UpdateUsersAboutDto } from './dto/create-users-about.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { AddressType, UsersAddress } from 'src/shared/entities/users-address.entity';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UserAddressResponseDto } from './dto/user-address-response.dto';
import { CreateProductDto } from '../admin/product/dto/create-product.dto';
import { S3Service } from 'src/shared/s3/s3.service';
import { Product, ProductStatus } from 'src/shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { ProductPaginationDto } from '../admin/product/dto/product-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from '../admin/product/dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from '../admin/product/dto/update-product.dto';
import { CreateWishlistDto } from '../admin/wishlist/dto/create-wishlist.dto';
import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';
import { CreateKycDetailDto, UpdateKycDetailDto } from '../admin/users/dto/create-user-kyc-detail.dto';
import { KycDetails } from 'src/shared/entities/user-kyc.entity';
import { CreateBankDetailDto } from '../admin/users/dto/create-user-bank-detail.dto';
import { UpdateBankDetailDto } from '../admin/users/dto/update-user-bank-detail.dto';
import { BankDetail } from 'src/shared/entities/user-bank-detail.entity';

import { UserProfileImage } from 'src/shared/entities/user-profile-image.entity';
import { Productcategory } from 'src/shared/entities/productcategory.entity';
import { PackingModeEntity } from 'src/shared/entities/packing-mode.entity';
import { CommissionType } from 'src/shared/entities/commission-type.entity';
import { ShippingTime } from 'src/shared/entities/shipping-time.entity';
import { Size } from 'src/shared/entities/size.entity';
import { Orientation } from 'src/shared/entities/orientation.entity';
import { InventProdListDto } from '../client/invent-product/dto/invent-prod-list.dto';
import { PaginationBaseDto } from 'src/shared/dto/pagination-base.dto';
import { WishlistInventProdDto } from './dto/wishlist-invent-prod-list.dto';



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly s3service: S3Service,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private imageRepo: Repository<ProductImage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfileImage)
    private readonly profileImageRepo: Repository<UserProfileImage>,

    @InjectRepository(UsersAbout)
    private readonly aboutRepo: Repository<UsersAbout>,

    @InjectRepository(KycDetails)
    private readonly kycRepo: Repository<KycDetails>,

    @InjectRepository(BankDetail)
    private readonly BankRepo: Repository<BankDetail>,

    @InjectRepository(UsersAddress)
    private readonly addressRepo: Repository<UsersAddress>,

    @InjectRepository(OtpVerification)
    private readonly otpveriRepo: Repository<OtpVerification>,

    @InjectRepository(PasswordResetToken)
    private readonly passresettokenRepo: Repository<PasswordResetToken>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private readonly otpService: OtpService,

    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,

  ) {}

  // artist.service.ts
async getArtistsWithArtworkCount(id: number) {
  const roleId = 4; // ✅ Artist role ID (keep configurable at top)

  const artists = await this.userRepository
  .createQueryBuilder('user')
  .innerJoin('user.roles', 'roles')
  .innerJoin('user.products', 'product') // user must have product
  .innerJoin('product.productInventory', 'inventory') // product must have inventory
  .where('roles.id = :roleId', { roleId })
  .andWhere('user.artist_type_id = :artistTypeId', { artistTypeId:id })
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
      .innerJoinAndSelect('user.addresses', 'address')
    .where('user.id = :id', { id })
    .andWhere('roles.id = :roleId', { roleId}) // ✅ restrict only artists
      .andWhere('address.type = :type', { type:AddressType.PERSONAL})
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
    throw new NotFoundException('Artist not found');
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
      .andWhere('address.type = :type', { type:   AddressType.PERSONAL })
      .select(['user.id', 'user.username','address.city','about.awards','about.shows','about.about','address.state','address.country','profileimg.imageUrl', 'user.artist_type_id'])
      .orderBy('user.username', 'ASC')
      .getMany();
  
    if (artists.length === 0) {
      throw new NotFoundException('Artists not found');
    }  
    return artists;
  }


  async getLoggedInUser(users: any): Promise<User> {
    const userId = users.sub.toString();
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profileImage'], // 👈 add relations if you need
    });

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
    const { email, mobile, password, username, userType } = dto;


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
      status: true, is_verified: true,
      password: await bcrypt.hash(password, 10),
      roles: [role], // assign role in array for ManyToMany
    });

    await this.userRepository.save(user);

    return { success: true, message: 'Registration complete', userId: user.id };
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


  async login(user: any) {
    if (!user) {
      this.logger?.warn?.('Login failed: user is undefined');
      throw new UnauthorizedException('Invalid login request');
    }
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r) => r.name),
      permissions: 'No permission', // optional
    };
    return {
      access_token: this.jwtService.sign(payload),
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

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const { oldPassword, password: newPassword } = dto;
    // 1. Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    // 3. Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be the same as old password');
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

    return this.login(result.user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'mobile', 'is_verified', 'username']
    });
  }

  async findByMobile(mobile: string) {
    return this.userRepository.findOne({
      where: { mobile }, relations: ['roles', 'roles.permissions'],
      select: ['id', 'email', 'password', 'mobile', 'is_verified', 'username']
    });
  }

  async findUsersByRole(roleName: string): Promise<UserListByRoleNameDto[]> {
    const users = await this.usersService.findUsersByRole(roleName);
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found for the specified role');
    }
    return users;
  }


  async createUserAbout(dto: CreateUsersAboutDto, users: any) {
    const userId = users.sub.toString();
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const about = this.aboutRepo.create({ ...dto, user });
    about.createdBy = userId;
    return this.aboutRepo.save(about);
  }


  async findOneAboutByUserId(users: any): Promise<UsersAbout> {
    const userId = users.sub.toString();
    const about = await this.aboutRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!about) throw new NotFoundException('User About  Details not found');
    return about;
  }

  async updateAbout(dto: UpdateUsersAboutDto, user: any) {
    const userId = user.sub.toString();
    const about = await this.aboutRepo.findOne({
      where:
      {
        user: { id: userId },
      },
      relations: ['user']
    });
    //   console.log(id,'---------',userId)
    //   const address = await this.addressRepo.findOne({ where: { id,userId } });
    if (!about) throw new NotFoundException('about not found');
    // if (address.user.id !== userId) throw new ForbiddenException('Not allowed');
    //console.log(id,'---------',address)
    Object.assign(about, dto);
    const withUser = await this.aboutRepo.save(about);

    return withUser;

  }




  async createAddress(dto: CreateUserAddressDto, user: any) {
    const userId = user.sub.toString();
    if (dto.type === AddressType.PERSONAL) {
      const existing = await this.addressRepo.count({ where: { userId, type: AddressType.PERSONAL } });
      if (existing >= 1) {
        throw new BadRequestException('You can only have one personal address');
      }
    } else {
      const count = await this.addressRepo.count({ where: { userId, type: dto.type } });
      if (count >= 5) {
        throw new BadRequestException(`You can only add up to 5 ${dto.type} addresses`);
      }
    }

    const address = this.addressRepo.create({
      ...dto,
      user: { id: userId },
      createdBy: userId,
      updatedBy: userId,
    });
    if (dto.isDefault && dto.type !== AddressType.PERSONAL) {
      await this.addressRepo.update({ userId, type: dto.type }, { isDefault: false });
    }
    const withUser = await this.addressRepo.save(address);
    return toUserAddressResponse(withUser);
  }


  // ✅ FIND ALL
  async findAllForUserAddress(
    addressType: AddressType, user: any
  ): Promise<UserAddressResponseDto[]> {
    const userId = user.sub.toString();
    const addresses = await this.addressRepo.find({
      where: {
        user: { id: userId },
        type: addressType, // ✅ type safe enum filter
      },
      relations: ['user'],
    });

    if (!addresses.length) {
      throw new NotFoundException(`User Address not found for type: ${addressType}`);
    }

    return addresses.map(toUserAddressResponse);
  }


  async updateAddress(id: number, dto: UpdateUserAddressDto, user: any) {
    const userId = user.sub.toString();
    const address = await this.addressRepo.findOne({
      where:
      {
        id: id,
        user: { id: userId },
      },
      relations: ['user']
    });
    //   console.log(id,'---------',userId)
    //   const address = await this.addressRepo.findOne({ where: { id,userId } });
    if (!address) throw new NotFoundException('Address not found');
    // if (address.user.id !== userId) throw new ForbiddenException('Not allowed');
    //console.log(id,'---------',address)
    Object.assign(address, dto);
    const withUser = await this.addressRepo.save(address);

    //return withUser;
    return toUserAddressResponse(withUser);
  }


  async createkycDetail(dto: CreateKycDetailDto, users: any) {
    const userId = users.sub.toString();
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const bankdetail = await this.kycRepo.findOne({
      where: { userId: userId },
      //  relations: ['user'],
    });
    if (bankdetail) throw new NotFoundException('Kyc Details Allready Exits');
    const about = this.kycRepo.create({ ...dto, user });
    about.createdBy = userId;
    return this.kycRepo.save(about);
  }


  // ✅ FIND ALL
  async findAllKyc(userId: number): Promise<KycDetails> {
    //  userId = user.sub.toString();
    const user_kyc = await this.kycRepo.findOne({
      where: { userId: userId },
      // relations: ['user'],
    });
    if (!user_kyc) throw new NotFoundException(`User  KYC not found `,);
    return user_kyc;
  }

  async updatekyc(dto: UpdateKycDetailDto, user: any) {
    const userId = user.sub.toString();
    const address = await this.kycRepo.findOne({
      where:
      {
        userId: userId
      },

      //  relations: ['user']
    });
    //   console.log(id,'---------',userId)
    //   const address = await this.addressRepo.findOne({ where: { id,userId } });
    if (!address) throw new NotFoundException('Kyc not found');
    // if (address.user.id !== userId) throw new ForbiddenException('Not allowed');
    //console.log(id,'---------',address)
    Object.assign(address, dto);
    const withUser = await this.kycRepo.save(address);

    return withUser;
    //  return toUserAddressResponse(withUser);
  }


  async createBankDetail(dto: CreateBankDetailDto, users: any) {
    const userId = users.sub.toString();
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const bankdetail = await this.BankRepo.findOne({
      where: { userId: userId },
      //  relations: ['user'],
    });
    if (bankdetail) throw new NotFoundException('Bank Details Allready Exits');
    const about = this.BankRepo.create({ ...dto, user });
    about.createdBy = userId;
    return this.BankRepo.save(about);
  }


  // ✅ FIND ALL
  async findAllBank(userId: number): Promise<BankDetail> {
    //  userId = user.sub.toString();
    const bank_details = await this.BankRepo.findOne({
      where: { userId: userId },
      //  relations: ['user'],
    });
    if (!bank_details) throw new NotFoundException(`User  Bank Details not found `,);
    return bank_details;
  }

  async updateBank(dto: UpdateBankDetailDto, user: any) {
    const userId = user.sub.toString();
    const address = await this.BankRepo.findOne({
      where: { userId: userId },
      //  relations: ['user'],
    });
    // relations: ['user'] }); 
    //   console.log(id,'---------',userId)
    //   const address = await this.addressRepo.findOne({ where: { id,userId } });
    if (!address) throw new NotFoundException('Kyc not found');
    // if (address.user.id !== userId) throw new ForbiddenException('Not allowed');
    //console.log(id,'---------',address)
    Object.assign(address, dto);
    const withUser = await this.BankRepo.save(address);

    return withUser;
    //  return toUserAddressResponse(withUser);
  }



  async createProduct(dto: CreateProductDto, user: any, imageFilename?: Express.Multer.File): Promise<Product> {
    const userId = user.sub.toString();
    let titleImage: string | null = null;
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);

      const key = `products/${Date.now()}-${cleanName}`;
      titleImage =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }

    const product = this.productRepository.create({
      ...dto,
      // defaultImage: imageFilename ? `/product-images/${imageFilename}` : null,
      defaultImage: titleImage,

      createdBy: userId,
    });
    product.owner = userId;
    product.artist = userId;
    return this.productRepository.save(product);
  }
  async findAllProducts(
    paginationDto: ProductPaginationDto,
  ): Promise<PaginationResponseDto<ProductDto>> {
    const { page, limit, search,
      is_active
      //status


    } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.name LIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    /* const [result, products] = await queryBuilder.getManyAndCount();
 
     const [result, total] = await queryBuilder.getManyAndCount();*/

    const data = plainToInstance(ProductDto, products, {
      excludeExtraneousValues: true,
    });

    return new PaginationResponseDto(data, { total, page, limit });
  }
  async findOneProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['owner', 'wishlists', 'displayMappings'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    user: any,
    newImageFile?: Express.Multer.File | null,
  ): Promise<Product> {
    const product = await this.findOneProduct(id);
    if (!product) throw new NotFoundException('Product not found');

    if (newImageFile) {
      const cleanName = sanitizeFileName(newImageFile.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      //  const key = `products/${Date.now()}-${newImageFile.originalname}`;

      // Upload image to S3 (returns the file URL or key)
      const uploadedUrl = await this.s3service.uploadBuffer(
        key,
        newImageFile.buffer,
        newImageFile.mimetype, // make sure content-type is set!
      );

      // Delete old image if exists
      if (product.defaultImage) {
        await this.s3service.deleteObject(product.defaultImage);
      }

      // Save new URL/key in DB
      product.defaultImage = uploadedUrl;
    }

    //  Object.assign(product, updateProductDto);
    product.updatedBy = user.sub.toString();
    if (updateProductDto.productTitle !== undefined) {
      product.productTitle = updateProductDto.productTitle;
    } if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    } if (updateProductDto.width !== undefined) {
      product.width = updateProductDto.width;
    } if (updateProductDto.height !== undefined) {
      product.height = updateProductDto.height;
    } if (updateProductDto.depth !== undefined) {
      product.depth = updateProductDto.depth;
    } if (updateProductDto.weight !== undefined) {
      product.weight = updateProductDto.weight;
    } if (updateProductDto.created_in !== undefined) {
      product.created_in = updateProductDto.created_in;
    }
    product.category = { id: updateProductDto.category_id } as Productcategory;
    product.packingMode = { id: updateProductDto.packingModeId } as PackingModeEntity;
    product.commissionType = { id: updateProductDto.commissionTypeId } as CommissionType;
    product.shippingTime = { id: updateProductDto.shippingTimeId } as ShippingTime;
    product.size = { id: updateProductDto.size_id } as Size;

    product.orientation = { id: updateProductDto.orientation_id } as Orientation;

    return this.productRepository.save(product);
  }


  async addImageProduct(productId: number, imageFilename: Express.Multer.File) {
    let imageurl;
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (imageFilename) {
      const cleanName = sanitizeFileName(imageFilename.originalname);
      const key = `products/${Date.now()}-${cleanName}`;
      imageurl =
        await this.s3service.uploadBuffer(key, imageFilename.buffer, imageFilename.mimetype);
    }


    const image = this.imageRepo.create({
      //imagePath: `/product-images/${fileName}`, // just the relative path 
      imagePath: imageurl, // just the relative path
      product,
    });

    return this.imageRepo.save(image);
  }


  async deleteProductImage(imageId: number) {
    const image = await this.imageRepo.findOne({ where: { id: imageId }, relations: ['product'] });
    if (!image) throw new NotFoundException('Image not found');

    // const fullPath = path.join(process.cwd(), 'uploads/product-images', path.basename(image.imagePath));
    // if (fs.existsSync(fullPath)) {
    //   fs.unlinkSync(fullPath);
    // }
    // Delete old image if exists
    if (image.imagePath) {
      // const oldKey = this.extractS3Key(blog.titleImage);
      await this.s3service.deleteObject(image.imagePath);
    }

    return this.imageRepo.remove(image);
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

export function toUserAddressResponse(address: UsersAddress): UserAddressResponseDto {
  return {
    id: address.id,
    type: address.type,
    address: address.address,
    city: address.city,
    state: address.state,
    country: address.country,
    pin: address.pin,
    // aadhar: address.aadhar,
    contact: address.contact,
    // GSTIN: address.GSTIN,
    other_phone: address.other_phone,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
    user: {
      id: address.user.id,
      username: address.user.username,

    },
  };
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








async getArtistsWithArtworkCount() {
  const subQuery = this.userRepository
    .createQueryBuilder('u')
    .select('p.userId', 'userId')
    .addSelect('p.defaultImage', 'defaultImage')
    .innerJoin('u.products', 'p')
    .innerJoin('p.productInventory', 'inv')
    .where('p.is_active = :status', { status: 'Active' })
    .andWhere('inv.status = :statuss', { statuss: true })
    .orderBy('inv.updatedAt', 'DESC');

  const artists = await this.userRepository
    .createQueryBuilder('user')
    .innerJoin('user.roles', 'roles')
    .leftJoin('user.products', 'product')
    .leftJoin('product.productInventory', 'inventory')
    .where('roles.id = :roleId', { roleId: 13 }) // artist role
    .andWhere('product.is_active = :status', { status: 'Active' })
    .andWhere('inventory.status = :statuss', { statuss: true })
    .select('user.id', 'id')
    .addSelect('user.username', 'username')
    .addSelect('user.artist_type_id', 'artist_type_id')
    .addSelect('COUNT(product.id)', 'artworkCount')
    .addSelect((qb) => {
      return qb
        .subQuery()
        .select('p.defaultImage')
        .from('product', 'p')
        .innerJoin('p.productInventory', 'inv')
        .where('p.userId = user.id')
        .andWhere('p.is_active = :status', { status: 'Active' })
        .andWhere('inv.status = :statuss', { statuss: true })
        .orderBy('inv.updatedAt', 'DESC')
        .limit(1);
    }, 'defaultImage')
    .groupBy('user.id')
    .setParameters({ status: 'Active', statuss: true })
    .getRawMany();

  if (artists.length === 0) {
    throw new NotFoundException('No artists found with artworks');
  }

  return artists;
}

*/