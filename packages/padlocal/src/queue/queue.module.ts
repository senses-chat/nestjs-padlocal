import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '@senses-chat/padlocal-db';

import { processors } from './processor';
import { QueueService } from './queue.service';
import { PadlocalModule } from '../padlocal.module';
import { QUEUES } from '../config/queues';

@Module({
  imports: [
    StorageModule.register(),
    forwardRef(() => PadlocalModule),
    ConfigModule,
    BullModule.registerQueue(...QUEUES.queuesArray),
  ],
  providers: [QueueService, ...processors],
  exports: [QueueService],
})
export class QueueModule {}
