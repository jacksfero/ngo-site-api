import { Module, Logger, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseHealthService } from './database.health.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const logger = new Logger('TypeORM');

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          synchronize: false,
          autoLoadEntities: true,
          entityPrefix: 'my_',
          
          // Connection pool settings to prevent leaks
          extra: {
            connectionLimit: 8,
            acquireTimeout: 30000,
            idleTimeout: 60000, // Close idle connections after 60s
            timeout: 30000,
            charset: 'utf8mb4',
            multipleStatements: false,
          },
          
          logging: ['error'],
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      
      dataSourceFactory: async (options: DataSourceOptions) => {
        const logger = new Logger('DataSource');
        try {
          const dataSource = new DataSource(options);
          await dataSource.initialize();
          logger.log('✅ Database connection established');
          return dataSource;
        } catch (error) {
          logger.error('❌ Database connection failed', error.stack);
          throw error;
        }
      },
    }),
  ],
   providers: [DatabaseHealthService],
})
export class DatabaseModule implements OnApplicationShutdown, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  onModuleDestroy() {
    this.logger.log('Database module is being destroyed');
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutting down (${signal}). Closing database connections...`);
    
    if (this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        this.logger.log('✅ All database connections closed successfully');
      } catch (error) {
        this.logger.error('❌ Error closing database connections', error.stack);
      }
    }
  }
}
/*import { Module, Logger } from '@nestjs/common';
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
*/