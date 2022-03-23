import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import redisConfig from './config';

export const Module: DynamicModule = RedisModule.forRootAsync(
  {
    imports: [ConfigModule.forFeature(redisConfig)],
    useFactory: (configService: ConfigService) => configService.get('redis'),
    inject: [ConfigService],
  },
  false,
);
