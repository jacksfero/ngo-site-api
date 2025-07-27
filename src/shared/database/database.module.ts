import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesService } from 'src/modules/admin/roles/roles.service';
import { PermissionsService } from 'src/modules/admin/permissions/permissions.service';
import { RolesModule } from 'src/modules/admin/roles/roles.module';
import { PermissionsModule } from 'src/modules/admin/permissions/permissions.module';
import { RolesSeed } from './seeds/roles.seed';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        //  entities: [Surface],
        entityPrefix: 'my_',

        /* synchronize:
          configService.get<string>('DATABASE_SYNCHRONIZE', 'false') === 'true',*/
        synchronize:
          configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',

        logging: configService.get('DB_LOGGING') === 'true',
      //  logging: ['query', 'error']
      }),
    }),
  //  RolesModule,
   // PermissionsModule,

    //RolesService,
    // PermissionsService,
  ],
 // providers: [RolesSeed],
 // exports: [RolesSeed], // 👈 So AppModule can use it
})
export class DatabaseModule {}
