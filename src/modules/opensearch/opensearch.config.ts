import { registerAs } from '@nestjs/config';

import { ClientOptions } from '@opensearch-project/opensearch';

export default registerAs('opensearch', (): { config: ClientOptions } => ({
  config: {
    node: process.env.OPENSEARCH_NODE,
    ssl: {
      rejectUnauthorized: false,
    },
  },
}));
