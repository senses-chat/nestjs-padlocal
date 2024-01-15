import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client, ClientOptions } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService {
  public client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client(
      this.configService.get<ClientOptions>('opensearch.config'),
    );
  }
}
