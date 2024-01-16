import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { RedisService } from '~/modules/redis';

import { LoginStatus } from '../models';
import { LOGIN_START } from '../queues';

@Processor(LOGIN_START, {
  concurrency: 1,
})
export class LoginStartProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginStartProcessor.name);
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.redisService.client.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.LOGIN_START,
    );

    this.logger.verbose(`login start process: ${JSON.stringify(job.data)}`);
  }
}
