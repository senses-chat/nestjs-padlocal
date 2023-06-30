import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from 'src/db';

@Processor('friendRequest')
export class FriendRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(FriendRequestProcessor.name);
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

    const request = await this.prisma.wechatFriendshipRequest.findFirst({
      where: {
        id: job.data.requestId,
      },
    });

    this.logger.verbose(`friend request process: ${JSON.stringify(request)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
