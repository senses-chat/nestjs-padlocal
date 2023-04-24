import { forwardRef, Module } from '@nestjs/common';

import { StorageModule } from 'src/db';

import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';

@Module({
  imports: [StorageModule.register()],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
