import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const redisHost = process.env.REDIS_HOST;
        const redisPort = process.env.REDIS_PORT || 6379;

        if (redisHost) {
          try {
            console.log(
              `[Cache] Initializing Redis connection to ${redisHost}:${redisPort}`,
            );
            const store = await redisStore({
              socket: {
                host: redisHost,
                port: Number(redisPort),
              },
            });
            return { store };
          } catch (error) {
            console.warn(
              '[Cache] Redis initialization failed. Falling back to in-memory cache.',
              error,
            );
          }
        }

        console.log('[Cache] Using local in-memory storage fallback');
        return {}; // Defaults to in-memory store
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
