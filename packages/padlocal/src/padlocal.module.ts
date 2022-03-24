import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StorageModule } from '@senses-chat/wechat-db';

import { commandHandlers } from './commands';
import { PadlocalService } from './padlocal.service';

@Module({
  imports: [CqrsModule, StorageModule.register()],
  providers: [PadlocalService, ...commandHandlers],
  exports: [PadlocalService],
})
export class PadlocalModule {}
