import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException, Logger,
  ForbiddenException,
  Inject,
} from '@nestjs/common';

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
import { Surface } from 'src/shared/entities/surface.entity';
import { Medium } from 'src/shared/entities/medium.entity';
import { Subject } from 'src/shared/entities/subject.entity';
import { Style } from 'src/shared/entities/style.entity';
import { slugify } from 'src/shared/utils/slugify';
import { Cart } from 'src/shared/entities/cart.entity';
import { MailService } from 'src/shared/mail/mail.service';

// import { REQUEST } from '@nestjs/core';
  import { Request } from 'express';
import { ResetPassCreatedPayload } from 'src/shared/events/interfaces/event-payload.interface';


@Injectable()
export class AuthUserAddressService {
   private readonly logger = new Logger(AuthUserAddressService.name);
  constructor(
     private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
 
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly s3service: S3Service,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Style)
    private styleRepo: Repository<Style>,

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

 
  ) {}

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

  async findOneAddress(
    id: number, user: any
  ): Promise<UserAddressResponseDto> {
    const userId = user.sub.toString();
    const addresses = await this.addressRepo.findOne({
      where: {
         id: id,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!addresses) {
      throw new NotFoundException(`User Address not found for type: `);
    }

    return toUserAddressResponse(addresses);

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

 async removeAddress(id: number, user: any): Promise<{ message: string }> {
  const userId = user.sub.toString();
  const address = await this.addressRepo.findOne({
    where: { id: id, user: { id: userId } }
  });
  
  if (!address) {
    throw new NotFoundException('Address not found');
  }
  
  try {
    await this.addressRepo.remove(address);
    return {
      message: 'Address deleted successfully',
    };
  } catch (error) {
    throw new BadRequestException('Error deleting address');
  }
}
  
  /*************End User address Section */

 
}


export function toUserAddressResponse(address: UsersAddress): UserAddressResponseDto {
  return {
    id: address.id,
    type: address.type,
    address: address.address,
    name: address.name,
    city: address.city,
    state: address.state,
    country: address.country,
    pin: address.pin,
    isDefault: address.isDefault,
     phonecode: address.phonecode,
      phonecode_other: address.phonecode_other,
    contact: address.contact,
    pan_gstin: address.pan_gstin,
     trade_name: address.trade_name,
    other_phone: address.other_phone,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
    user: {
      id: address.user.id,
      username: address.user.username,

    },
  };
}