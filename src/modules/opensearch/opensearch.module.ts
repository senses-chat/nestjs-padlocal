import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import opensearchConfig from './opensearch.config';
import { OpenSearchService } from './opensearch.service';

@Module({
  imports: [ConfigModule.forFeature(opensearchConfig)],
  providers: [OpenSearchService],
  exports: [OpenSearchService],
})
export class OpenSearchModule {}
