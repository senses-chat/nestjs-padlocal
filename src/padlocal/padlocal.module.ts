import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { RedisModule } from '@/modules/redis';
import { MinioModule } from '@/modules/minio';
import { OpenSearchModule } from '@/modules/opensearch';
import { DrizzleModule } from '@/modules/drizzle';

import { processors } from './processors';
import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';
import {
  ACTIONS_OPTIONS,
  FRIEND_REQUEST_OPTIONS,
  KICK_OUT_OPTIONS,
  LOGIN_QR_CODE_OPTIONS,
  LOGIN_START_OPTIONS,
  LOGIN_SUCCESS_OPTIONS,
  NEW_FRIEND_REQUEST_OPTIONS,
  NEW_MESSAGE_OPTIONS,
  NEW_RAW_MESSAGE_OPTIONS,
  SYNC_CONTACT_OPTIONS,
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
  SYNC_CONTACT_OPTIONS,
];

@Module({
  imports: [
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
