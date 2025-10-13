import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';
import { Permission } from '../../../shared/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]), // 👈 register both
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {
  constructor() {
   // console.log('----Permission in Module-----User  :', User); // 👈 Should print the class
   // console.log('---Permission in Module------Role  :', Role);
  //  console.log('-Permission in Module--------Permission in  :', Permission);
  }
}
