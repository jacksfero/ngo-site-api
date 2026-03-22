import { Module }  from  '@nestjs/common'; 
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';
import { Permission } from '../../../shared/entities/permission.entity';
import { UsersAbout } from '../../../shared/entities/users-about.entity';
import { UsersAddress } from 'src/shared/entities/users-address.entity';
import { BankDetail } from 'src/shared/entities/user-bank-detail.entity';
import { KycDetails } from 'src/shared/entities/user-kyc.entity';
 
import { UserProfileImage } from 'src/shared/entities/user-profile-image.entity';
 import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfileImage,   Role, Permission, UsersAbout, UsersAddress, BankDetail, KycDetails])
  , CqrsModule
  
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
