import { forwardRef, Module } from '@nestjs/common';

import { StorageModule } from 'src/db';
import { ConfigModule } from '@nestjs/config';

import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [StorageModule.register(), forwardRef(() => QueueModule), ConfigModule],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
