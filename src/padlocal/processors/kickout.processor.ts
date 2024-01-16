import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { RedisService } from '~/modules/redis';

import { LoginStatus } from '../models';
import { KICK_OUT } from '../queues';

@Processor(KICK_OUT, {
  concurrency: 1,
})
export class KickoutProcessor extends WorkerHost {
  private readonly logger = new Logger(KickoutProcessor.name);
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.redisService.client.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.LOGGED_OUT,
    );

    this.logger.verbose(`kickout process: ${JSON.stringify(job.data)}`);
  }
}
