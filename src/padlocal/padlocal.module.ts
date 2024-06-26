import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { RedisModule } from '~/modules/redis';
import { MinioModule } from '~/modules/minio';
import { OpenSearchModule } from '~/modules/opensearch';
import { DrizzleModule } from '~/modules/drizzle';

import { processors } from './processors';
import padlocalConfig from './padlocal.config';
import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';
import {
  ACTIONS_OPTIONS,
  FILE_MESSAGE_OPTIONS,
  FRIEND_REQUEST_OPTIONS,
  IMAGE_MESSAGE_OPTIONS,
  KICK_OUT_OPTIONS,
  LOGIN_QR_CODE_OPTIONS,
  LOGIN_START_OPTIONS,
  LOGIN_SUCCESS_OPTIONS,
  NEW_FRIEND_REQUEST_OPTIONS,
  NEW_MESSAGE_OPTIONS,
  NEW_RAW_MESSAGE_OPTIONS,
  SYNC_CONTACT_OPTIONS,
  VOICE_MESSAGE_OPTIONS,
} from './queues';

const queues = [
  ACTIONS_OPTIONS,
  KICK_OUT_OPTIONS,
  LOGIN_QR_CODE_OPTIONS,
  LOGIN_START_OPTIONS,
  LOGIN_SUCCESS_OPTIONS,
  NEW_FRIEND_REQUEST_OPTIONS,
  FRIEND_REQUEST_OPTIONS,
  NEW_MESSAGE_OPTIONS,
  NEW_RAW_MESSAGE_OPTIONS,
  IMAGE_MESSAGE_OPTIONS,
  VOICE_MESSAGE_OPTIONS,
  FILE_MESSAGE_OPTIONS,
  SYNC_CONTACT_OPTIONS,
];

@Module({
  imports: [
    ConfigModule.forFeature(padlocalConfig),
    RedisModule,
    MinioModule,
    OpenSearchModule,
    DrizzleModule,
    BullModule.registerQueue(...queues),
    BullBoardModule.forFeature(
      ...queues.map((queue) => ({
        name: queue.name,
        adapter: BullMQAdapter,
      })),
    ),
  ],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService, ...processors],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
