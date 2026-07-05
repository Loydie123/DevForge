import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT ?? 6379;

        if (redisUrl ?? redisHost) {
          try {
            // URL-based takes priority (supports rediss:// TLS — required for Upstash)
            const storeOptions = redisUrl
              ? { url: redisUrl }
              : { socket: { host: redisHost, port: Number(redisPort) } };

            console.log(
              redisUrl
                ? '[Cache] Connecting to Redis via URL'
                : `[Cache] Connecting to Redis at ${redisHost}:${redisPort}`,
            );

            const store = await redisStore(storeOptions);
            return { store };
          } catch (error) {
            console.warn(
              '[Cache] Redis connection failed. Falling back to in-memory cache.',
              error,
            );
          }
        }

        console.log('[Cache] No Redis configured — using in-memory cache');
        return {};
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
