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
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        // ⚠️ Recommended for production
        synchronize: true,
       /// migrationsRun: true,
          ssl: {
              rejectUnauthorized: false, // Required for Aiven free tier
            },
        autoLoadEntities: true,
        entityPrefix: 'ng_',

        // ✔ VALID MYSQL2 timeout
        connectTimeout: 30000, 

        // ✔ MySQL2 pool settings
        extra: {
          connectionLimit: 5,
          waitForConnections: true,
          queueLimit: 0,
          charset: 'utf8mb4',
          multipleStatements: false,
          timezone: 'Z',
          decimalNumbers: true,
        },

       // logging: ['error'],
        logging: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      

     dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        return dataSource;
      },
    }),
  ],
  providers: [DatabaseHealthService],
})
export class DatabaseModule implements OnApplicationShutdown, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    private readonly dataSource: DataSource,
  ) { }

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