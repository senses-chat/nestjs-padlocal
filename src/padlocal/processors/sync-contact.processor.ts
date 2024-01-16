import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { DrizzleService } from '~/modules/drizzle';
import { wechatContact } from '~/modules/drizzle/schema';
import { RedisService } from '~/modules/redis';

@Processor('syncContact')
export class SyncContactProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncContactProcessor.name);
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${job.data.accountId} is not logged in`);
    }

    await this.drizzleService.db
      .insert(wechatContact)
      .values({
        sourceUsername: loggedInUsername,
        ...job.data.contact,
      })
      .onConflictDoUpdate({
        target: [wechatContact.sourceUsername, wechatContact.username],
        set: {
          ...job.data.contact,
        },
      });

    this.logger.verbose(`sync contact process: ${JSON.stringify(job.data)}`);
  }
}
