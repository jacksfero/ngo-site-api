import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connectWithRetry, patchQueryRunner } from './database.providers';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const logger = new Logger('TypeORM');

        const options: TypeOrmModuleOptions = {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          synchronize: false,
          autoLoadEntities: true,
          entityPrefix: 'my_',
          extra: {
            connectionLimit: 10,
            connectTimeout: 10000,
           // keepAlive: true,
             waitForConnections: true,
            queueLimit: 0,   
          },
          // ✅ fix: NestJS expects boolean | 'all' | ['query', 'error', ...]
          logging: ['error', 'warn'] as any,
        };

        // Initialize DataSource manually for retry logic
        const dataSource = new DataSource(options as any);

        await connectWithRetry(dataSource);
        patchQueryRunner(dataSource);

        logger.log('✅ TypeORM initialized successfully');
        return options;
      },
    }),
  ],
})
export class DatabaseModule {}
