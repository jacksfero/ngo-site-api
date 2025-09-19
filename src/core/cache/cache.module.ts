
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // default 5 minutes
      max: 100, // max number of items in cache (only for in-memory)
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
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
