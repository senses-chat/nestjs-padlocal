import { Module } from '@nestjs/common';

import { RedisModule } from '@/modules/redis';
import { MinioModule } from '@/modules/minio';
import { OpenSearchModule } from '@/modules/opensearch';

import { processors } from './processors';
import { PadlocalController } from './padlocal.controller';
import { PadlocalService } from './padlocal.service';
import { MessageParserService } from './parser.service';

@Module({
  imports: [RedisModule, MinioModule, OpenSearchModule],
  controllers: [PadlocalController],
  providers: [PadlocalService, MessageParserService, ...processors],
  exports: [PadlocalService, MessageParserService],
})
export class PadlocalModule {}
