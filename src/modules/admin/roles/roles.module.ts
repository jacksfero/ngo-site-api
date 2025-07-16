import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';
import { Permission } from '../../../shared/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {
 /* constructor() {
    console.log('----Role in Module-----User  :', User); // 👈 Should print the class
    console.log('---Role in Module------Role  :', Role);
    console.log('-Role in Module--------Permission in  :', Permission);
  }*/
}
