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
