import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from '@senses-chat/padlocal-db';

import { commandHandlers } from './commands';
import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    CqrsModule,
    StorageModule.register(),
    forwardRef(() => QueueModule),
  ],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService, ...commandHandlers],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
