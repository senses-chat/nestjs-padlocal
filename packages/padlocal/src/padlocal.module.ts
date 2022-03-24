import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from '@senses-chat/wechat-db';

import { commandHandlers } from './commands';
import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';

@Module({
  imports: [CqrsModule, StorageModule.register()],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService, ...commandHandlers],
  exports: [PadlocalService],
})
export class PadlocalModule {}
