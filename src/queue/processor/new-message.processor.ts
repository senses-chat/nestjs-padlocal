import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PadlocalMessageContentType } from '../../padlocal/models';
import { PrismaService } from 'src/db';
import { QueueService } from '../queue.service';

@Processor('newMessage')
export class NewMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewMessageProcessor.name);
  constructor(
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (
      job.data.message.content.type ===
      PadlocalMessageContentType.FRIENDSHIP_REQUEST
    ) {
      await this.queueService.add('newFriendRequest', {
        accountId: job.data.accountId,
        friendRequest: job.data.message.content,
      });
    }

    await this.prisma.newMessage.create({
      data: { accountId: job.data.accountId, ...job.data.message },
    });

    this.logger.log(`new message process: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
