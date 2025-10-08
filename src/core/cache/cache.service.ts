// cache.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis'; // only for typing

export interface CacheOptions {
  ttl?: number; // TTL in seconds
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl: number;
  private readonly cacheType: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTtl = this.configService.get<number>('CACHE_TTL') || 300;
    this.cacheType = this.configService.get<string>('CACHE_TYPE') || 'memory';
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value !== undefined && value !== null ? value : null;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      // ✅ Fix: Handle undefined ttl with default value
      //const ttl = (options?.ttl || this.defaultTtl) * 1000;
      const ttl = options?.ttl || this.defaultTtl;
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}:`, error);
    }
  }

  /**
   * Reset entire cache (use with caution) - REMOVED as it doesn't exist in Cache interface
   * Use del() for individual keys or implement pattern-based deletion for Redis
   */
  // async reset(): Promise<void> {
  //   try {
  //     await this.cacheManager.reset();
  //   } catch (error) {
  //     this.logger.error('Failed to reset cache:', error);
  //   }
  // }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    
    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }
    
    return result;
  }

  /**
   * Set multiple values at once
   */
  async mset<T>(keyValues: Map<string, T>, options?: CacheOptions): Promise<void> {
    for (const [key, value] of keyValues) {
      await this.set(key, value, options);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ type: string; status: string }> {
    return {
      type: this.cacheType,
      status: 'active',
    };
  }

  /**
   * Generate cache key with namespace
   */
  generateKey(namespace: string, id: string): string {
    return `${namespace}:${id}`.toLowerCase();
  }

  /**
   * Pattern-based deletion (Redis-specific, falls back to individual deletion for memory cache)
   */
  async deletePattern(pattern: string): Promise<void> {
    // This is a simplified version. For Redis, you'd use SCAN + DEL
    // For memory cache, we can't easily pattern delete, so we'll log a warning
 if (this.cacheType.includes('redis')) {
      try {
        // Get underlying Redis client
       // const client: RedisClientType = (this.cacheManager.store as any).getClient();
        const client: RedisClientType = (this.cacheManager.stores[0] as any).getClient();

        const keys = await client.keys(pattern);
        if (keys.length) {
          await client.del(keys);
          this.logger.log(`Deleted ${keys.length} keys matching: ${pattern}`);
        } else {
          this.logger.log(`No keys matched pattern: ${pattern}`);
        }
      } catch (error) {
        this.logger.error(`Failed to delete pattern ${pattern}:`, error);
      }
    } else {
      this.logger.warn(`Pattern-based deletion not supported for cache type: ${this.cacheType}`);
    }
 

  //  this.logger.warn(`Pattern-based deletion not fully supported for cache type: ${this.cacheType}`);
  //  this.logger.warn(`Consider using individual key deletion instead of pattern: ${pattern}`);
  }
}