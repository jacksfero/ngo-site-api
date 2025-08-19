import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,Logger,
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
import { OtpType,UserType,StartEmailVerificationDto, StartMobileVerificationDto } from './dto/start-verification.dto';
//import { LoginDto } from './dto/login.dto';
//import { OtpLoginDto } from './dto/otp-login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { PasswordResetToken } from 'src/shared/entities/password-reset-token.entity';
import { randomBytes } from 'crypto';
import { UsersAbout } from 'src/shared/entities/users-about.entity';
import { CreateUsersAboutDto } from './dto/create-users-about.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { UserAddressResponseDto } from './dto/user-address-response.dto';
import { CreateProductDto } from '../admin/product/dto/create-product.dto';
import { S3Service } from 'src/shared/s3/s3.service';
import { Product } from 'src/shared/entities/product.entity';
import { ProductImage } from 'src/shared/entities/product-image.entity';
import { ProductPaginationDto } from '../admin/product/dto/product-pagination.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ProductDto } from '../admin/product/dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from '../admin/product/dto/update-product.dto';
import { CreateWishlistDto } from '../admin/wishlist/dto/create-wishlist.dto';
import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { sanitizeFileName } from 'src/shared/utils/sanitizefilename';


 
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

    @InjectRepository(UsersAbout)
    private readonly aboutRepo: Repository<UsersAbout>,

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


  // async blacklistToken(token: string) {
  //   const decoded: any = this.jwtService.decode(token);
  //   const expiresAt = new Date(decoded.exp * 1000);
  
  //   await this.blacklistRepo.save({
  //     token,
  //     expiresAt,
  //   });
  // }

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
      status:true,is_verified:true,
      password: await bcrypt.hash(password, 10),
      roles: [role], // assign role in array for ManyToMany
    });
  
    await this.userRepository.save(user);
  
    return { success: true, message: 'Registration complete', userId: user.id };
  }


    async validateUser(loginId:string, password:string): Promise<any> {
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
          throw new NotFoundException(`User not found for loginId: ${loginId}`);
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
       // console.log('Is password valid?', isPasswordValid);
    
        if (!isPasswordValid) {
          this.logger.warn(`Invalid password attempt for user: ${user.id}`);
          throw new UnauthorizedException(`Invalid password`);
        }
    
        const { password: _, ...result } = user;
        return result;
    
      } catch (error) {
        this.logger.error(`Error during validation: ${error.message}`);
        throw new BadRequestException(`Error during validation: ${error.message}`);
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
      permissions: user.roles?.flatMap((r) => r.permissions?.map((p) => p.name)) || [], // optional
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async sendResetPasswordOtp(dto: SendOtpDto, ipAddress?: string) {
   // const { identifier, type, userType  } = dto;
    const { identifier, type, userType  } = dto;
   // console.log('===========',userType);
   return this.otpService.sendOtp(identifier,type,UserType.FORGOT_PASSWORD, ipAddress);
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
    const { identifier, type, userType  } = dto;
   // console.log('===========',userType);
    return this.otpService.sendOtp(identifier,type,userType as UserType, ipAddress);
  } 
  
 
  async loginWithOtp(dto: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp({ ...dto, userType: UserType.LOGIN });
  
    if (!result.success || !result.user) {
      throw new UnauthorizedException('Invalid OTP or user not found');
    }
  
    return this.login(result.user);
  }   
  
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email },
     
    });
  }
  
  async findByMobile(mobile: string) {
    return this.userRepository.findOne({ where: { mobile } ,relations: ['roles', 'roles.permissions'] });
  }

  async findUsersByRole(roleName: string): Promise<UserListByRoleNameDto[]> {
    const users = await this.usersService.findUsersByRole(roleName);
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found for the specified role');
    }
    return users;
  }


  async createUserAbout(dto: CreateUsersAboutDto,userId: number,users:any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const about = this.aboutRepo.create({ ...dto, user });
       about.createdBy = users.sub.toString();
    return this.aboutRepo.save(about);
  }


  async findOneAboutByUserId(userId: number) {
    return this.aboutRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }


  async createAddress(dto: CreateUserAddressDto, user:any ) {
    const userId = user.sub.toString();
    const address = this.addressRepo.create({
      ...dto,
       user: { id: userId },
       createdBy:userId,
      updatedBy: userId,
    });
   const withUser = await this.addressRepo.save(address);
    return toUserAddressResponse(withUser);
  }

 
    // ✅ FIND ALL
    async findAllForUserAddress(userId: number): Promise<UserAddressResponseDto[]> {
      const addresses = await this.addressRepo.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      return addresses.map(toUserAddressResponse);
    }
  

  async updateAddress(  dto: UpdateUserAddressDto,user:any) {
    const userId = user.sub.toString();
    const address = await this.addressRepo.findOne({ where: 
      {
        user: { id: userId },
        id:dto.id   },
      relations: ['user'] });
    if (!address) throw new NotFoundException('Address not found');
   // if (address.user.id !== userId) throw new ForbiddenException('Not allowed');

    Object.assign(address, dto );
    const withUser =  await this.addressRepo.save(address);

    return toUserAddressResponse(withUser);
  }


async createProduct(dto: CreateProductDto, user: any, imageFilename?:Express.Multer.File ): Promise<Product> {
  const userId = user.sub.toString();
  let titleImage: string | null = null;
  if(imageFilename){
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
  const { page , limit, search,status } = paginationDto;
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
  
    return new PaginationResponseDto(data, { total, page, limit  });
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

  Object.assign(product, updateProductDto);
  product.updatedBy = user.sub.toString();

  return this.productRepository.save(product);
}


async addImageProduct(productId: number, imageFilename:Express.Multer.File) {
  let imageurl;
  const product = await this.productRepository.findOne({ where: { id: productId } });
  
  if (!product)
    {
      throw new NotFoundException('Product not found');
    }
  if(imageFilename){
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
 
  const product = await this.productRepository.findOneBy({
    id: dto.productId,
  });
 
  if (!product) throw new NotFoundException('Product not found');

  const existing = await this.wishlistRepository.findOne({
    where: {
      user: { id: user.sub.toString() },
      product: { id: product.id },
    },
  });

  if (existing) {
    throw new ConflictException('Product already in wishlist');
  }

  const wishlist = this.wishlistRepository.create({ user, product });
  return this.wishlistRepository.save(wishlist);
}
async getUserWishlist(userId: number): Promise<Wishlist[]> {
  return this.wishlistRepository.find({
    where: { user: { id: userId } },
    relations: ['product'],
    order: { createdAt: 'DESC' },
  });
}
async removeWishList(id: number) : Promise<void> {
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
    aadhar: address.aadhar,
    contact: address.contact,
    GSTIN: address.GSTIN,
    tradeName: address.tradeName,
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
  */