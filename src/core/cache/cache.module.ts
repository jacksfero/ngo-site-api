// cache.module.ts
import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
  AWS_REDIS = 'aws_redis',
}

interface CacheConfig {
  type: CacheType;
  host?: string;
  port?: number;
  password?: string;
  ttl?: number;
  max?: number;
  tls?: boolean;
}

@Global()
@Module({})
export class UnifiedCacheModule {
  static registerAsync(options?: {
    useFactory?: (...args: any[]) => Promise<CacheConfig> | CacheConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: UnifiedCacheModule,
      imports: [
        CacheModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService): Promise<CacheModuleOptions> => {
            // Get cache configuration from environment or use defaults
            const cacheConfig: CacheConfig = {
              type: (configService.get<CacheType>('CACHE_TYPE') as CacheType) || CacheType.MEMORY,
              host: configService.get('REDIS_HOST'),
              port: configService.get<number>('REDIS_PORT'),
              password: configService.get('REDIS_PASSWORD'),
              ttl: configService.get<number>('CACHE_TTL') || 300, // 5 minutes
              max: configService.get<number>('CACHE_MAX_ITEMS') || 100,
              tls: configService.get('REDIS_TLS_ENABLED') === 'true',
            };

            return UnifiedCacheModule.createCacheOptions(cacheConfig);
          },
          inject: [ConfigService],
        }),
      ],
       providers: [CacheService],
      exports: [CacheModule,CacheService],
    };
  }

  private static async createCacheOptions(config: CacheConfig): Promise<CacheModuleOptions> {
    switch (config.type) {
      case CacheType.REDIS:
      case CacheType.AWS_REDIS:
        return await UnifiedCacheModule.createRedisOptions(config);
      case CacheType.MEMORY:
      default:
        return UnifiedCacheModule.createMemoryOptions(config);
    }
  }

  private static createMemoryOptions(config: CacheConfig): CacheModuleOptions {
    // ✅ Fix: Handle undefined ttl with default value
    const ttl = (config.ttl || 300) * 1000; // Convert to milliseconds
    
    return {
      ttl: ttl,
      max: config.max || 100,
      isCacheableValue: (value: any) => value !== undefined && value !== null,
    };
  }

  private static async createRedisOptions(config: CacheConfig): Promise<CacheModuleOptions> {
    try {
      // Use dynamic import for better compatibility
      const { redisStore } = await import('cache-manager-redis-store');

      // ✅ Fix: Handle undefined values with defaults
      const redisConfig: any = {
        socket: {
          host: config.host || 'localhost',
          port: config.port || 6379,
          ...(config.tls && { tls: config.tls }),
        },
        password: config.password,
        ttl: config.ttl || 300, // Default 5 minutes
      };

      // AWS ElastiCache specific optimizations
      if (config.type === CacheType.AWS_REDIS) {
        redisConfig.socket = {
          ...redisConfig.socket,
          tls: config.tls !== false, // Default to true for AWS
          connectTimeout: 10000,
          lazyConnect: true,
          keepAlive: 5000,
        };
        redisConfig.maxRetriesPerRequest = 3;
        redisConfig.enableReadyCheck = true;
      }

      const store = await redisStore(redisConfig);

      // ✅ Fix: Handle undefined ttl with default value
      const ttl = (config.ttl || 300) * 1000; // Convert to milliseconds

      return {
        store: () => store,
        ttl: ttl,
        max: config.max || 100,
        isCacheableValue: (value: any) => value !== undefined && value !== null,
      };
    } catch (error) {
      console.warn('Redis not available, falling back to memory cache');
      return UnifiedCacheModule.createMemoryOptions(config);
    }
  }
}
/*

import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        if (redisHost && redisPort) {
          return {
            store: redisStore as any,
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            ttl: 300, // default 5 min
          };
        }

        // fallback: in-memory cache
        return {
          isGlobal: true,
          ttl: 300,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}


/*
user anywheere
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MediumService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getActiveList() {
    const cacheKey = 'active_medium_list';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const data = await this.fetchFromDb();

    await this.cacheManager.set(cacheKey, data, 300); // 5 min
    return data;
  }
}


*/





// src/core/cache/cache-config.module.ts
/* import { Module, CacheModule } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true, // 👈 makes cache available everywhere
      useFactory: async () => {
        if (process.env.REDIS_HOST) {
          // ✅ Redis mode (production)
          return {
            store: await redisStore({
              socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
              },
              password: process.env.REDIS_PASSWORD || undefined,
              ttl: 300, // default TTL in seconds
            }),
          };
        }

        // ✅ In-memory mode (development / fallback)
        return {
          ttl: 300, // default TTL in seconds
          max: 100, // max items in cache
        };
      },
    }),
  ],
})
export class CacheConfigModule {}
*/
