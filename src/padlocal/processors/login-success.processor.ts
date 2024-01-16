import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

import { RedisService } from '~/modules/redis';

import { LoginStatus } from '../models';
import { LOGIN_SUCCESS, SYNC_CONTACT } from '../queues';

@Processor(LOGIN_SUCCESS, {
  concurrency: 1,
})
export class LoginSuccessProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginSuccessProcessor.name);
  constructor(
    private readonly redisService: RedisService,
    @InjectQueue(SYNC_CONTACT)
    private readonly syncContactQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.redisService.client.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.LOGGED_IN,
    );

    await this.redisService.client.set(
      `loggedInUser:${job.data.accountId}`,
      job.data.contactSelf.username,
    );

    // sync self contact
    await this.syncContactQueue.add('syncContact', {
      accountId: job.data.accountId,
      contact: job.data.contactSelf,
    });

    this.logger.verbose(`login success process: ${JSON.stringify(job.data)}`);
  }
}
