import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

import { PadlocalMessageContentType } from '../models';
import { NEW_FRIEND_REQUEST, NEW_MESSAGE } from '../queues';

@Processor(NEW_MESSAGE)
export class NewMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewMessageProcessor.name);
  constructor(
    @InjectQueue(NEW_FRIEND_REQUEST)
    private readonly newFriendRequestQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (
      job.data.message.content.type ===
      PadlocalMessageContentType.FRIENDSHIP_REQUEST
    ) {
      await this.newFriendRequestQueue.add('newFriendRequest', {
        accountId: job.data.accountId,
        friendRequest: job.data.message.content,
      });
    }

    // TODO: save message to opensearch

    // await this.prisma.newMessage.upsert({
    //   where: { id: job.data.message.id },
    //   create: { ...job.data.message },
    //   update: { ...job.data.message },
    // });

    this.logger.log(`new message process: ${JSON.stringify(job.data)}`);
  }
}
