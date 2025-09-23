// configuration.ts
export const configurationCache = () => ({
  // Cache Configuration
  // Cache Configuration with explicit types
  CACHE_TYPE: process.env.CACHE_TYPE || 'memory',
  CACHE_TTL: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 300,
  CACHE_MAX_ITEMS: process.env.CACHE_MAX_ITEMS ? parseInt(process.env.CACHE_MAX_ITEMS) : 100,

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_TLS_ENABLED: process.env.REDIS_TLS_ENABLED === 'true',
});