import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from '@senses-chat/padlocal-db';

@Processor('newFriendRequest')
export class NewFriendRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(NewFriendRequestProcessor.name);
  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const loggedInUsername = await this.kvStorage.get(
      `loggedInUser:${job.data.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${job.data.accountId} is not logged in`);
    }

    await this.prisma.wechatFriendshipRequest.create({
      data: {
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
      },
    });

    this.logger.verbose(
      `new friend request process: ${JSON.stringify(job.data)}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
