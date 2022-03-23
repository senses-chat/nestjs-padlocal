import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import padlocalConfig from './config';
import { PadlocalService } from './padlocal.service';

@Module({
  imports: [ConfigModule.forFeature(padlocalConfig)],
  providers: [PadlocalService],
  exports: [PadlocalService],
})
export class PadlocalModule {}
