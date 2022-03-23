import { DynamicModule, Module, Logger } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

import { RedisModule } from './redis';
import { MinioModule } from './minio';
import { PrismaModule, PrismaService } from './prisma';
import {
  PADLOCAL_KV_STORAGE,
  PrismaKeyValueStorage,
  RedisKeyValueStorage,
} from './kv-storage';

/**
 * This storage module encapsulates all storage backends used by chat-operator.
 */
@Module({})
export class StorageModule {
  private static logger = new Logger(StorageModule.name);

  public static register(): DynamicModule {
    const modules: any[] = [MinioModule, PrismaModule];

    const useRedis = process.env.STORAGE_USE_REDIS === 'true';

    if (useRedis) {
      StorageModule.logger.debug('Using Redis for storage');
      modules.push(RedisModule);
    }

    const providers = [
      {
        provide: PADLOCAL_KV_STORAGE,
        inject: useRedis ? [RedisService] : [PrismaService],
        useFactory: useRedis
          ? (redisService: RedisService) =>
              new RedisKeyValueStorage(redisService, 'padlocal')
          : (prismaService: PrismaService) =>
              new PrismaKeyValueStorage(prismaService, 'padlocal'),
      },
    ];

    return {
      module: StorageModule,
      imports: modules,
      providers,
      exports: modules.concat(providers),
    };
  }
}
