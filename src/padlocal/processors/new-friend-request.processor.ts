import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

import { DrizzleService } from '~/modules/drizzle';
import { RedisService } from '~/modules/redis';
import { wechatFriendshipRequest } from '~/modules/drizzle/schema';

import { FRIEND_REQUEST, NEW_FRIEND_REQUEST } from '../queues';

@Processor(NEW_FRIEND_REQUEST, {
  concurrency: 10,
})
export class NewFriendRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(NewFriendRequestProcessor.name);
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly redisService: RedisService,
    @InjectQueue(FRIEND_REQUEST)
    private readonly friendRequestQueue: Queue,
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
      .insert(wechatFriendshipRequest)
      .values({
        sourceUsername: loggedInUsername,
        username: job.data.friendRequest.fromUsername,
        encryptUsername: job.data.friendRequest.encryptUsername,
        nickname: job.data.friendRequest.nickname,
        ticket: job.data.friendRequest.ticket,
        requestMessage: job.data.friendRequest.requestMessage,
        scene: job.data.friendRequest.scene,
        avatar: job.data.friendRequest.avatar,
        gender: job.data.friendRequest.gender,
        alias: job.data.friendRequest.alias,
        city: job.data.friendRequest.city,
        province: job.data.friendRequest.province,
        country: job.data.friendRequest.country,
        payload: job.data.friendRequest.payload,
      })
      .returning();

    this.logger.verbose(
      `new friend request process: ${JSON.stringify(job.data)}`,
    );

    await this.friendRequestQueue.add('friendRequest', {
      accountId: job.data.accountId,
      requestId: request[0].id,
    });
  }
}
