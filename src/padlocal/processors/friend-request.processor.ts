import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '~/modules/drizzle';
import { RedisService } from '~/modules/redis';
import { wechatFriendshipRequest } from '~/modules/drizzle/schema';

import { FRIEND_REQUEST } from '../queues';

@Processor(FRIEND_REQUEST, {
  concurrency: 10,
})
export class FriendRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(FriendRequestProcessor.name);
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

    const request = await this.drizzleService.db
      .select()
      .from(wechatFriendshipRequest)
      .where(eq(wechatFriendshipRequest.id, job.data.id))
      .limit(1);

    this.logger.verbose(`friend request process: ${JSON.stringify(request)}`);
  }
}
