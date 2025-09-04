import { Module } from '@nestjs/common';
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
import { ArtistType } from 'src/shared/entities/artist-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ArtistType, Role, Permission,UsersAbout,UsersAddress,BankDetail,KycDetails])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
 /* constructor() {
    console.log('----User in Module-----User  :', User); // 👈 Should print the class
    console.log('---User in Module------Role  :', Role);
    console.log('-User in Module--------Permission in  :', Permission);
  }*/
}
