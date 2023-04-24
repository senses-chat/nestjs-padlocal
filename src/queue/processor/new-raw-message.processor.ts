import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MessageParserService } from '../../padlocal/parser.service';
import { PrismaService } from 'src/db';
import { QueueService } from '../queue.service';

@Processor('newRawMessage')
export class NewRawMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewRawMessageProcessor.name);
  constructor(
    private readonly parser: MessageParserService,
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`new raw message process: ${JSON.stringify(job.data)}`);
    await this.prisma.rawMessage.create({
      data: { accountId: job.data.accountId, ...job.data.rawMessage },
    });

    await this.queueService.add('newMessage', {
      accountId: job.data.accountId,
      message: this.parser.parseMessage(job.data.rawMessage),
    });
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
