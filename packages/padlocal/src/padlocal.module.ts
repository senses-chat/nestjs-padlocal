import { forwardRef, Module } from '@nestjs/common';

import { StorageModule } from '@senses-chat/padlocal-db';

import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [StorageModule.register(), forwardRef(() => QueueModule)],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
