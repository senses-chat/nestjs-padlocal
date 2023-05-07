import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { MessageParserService } from '../../padlocal/parser.service';
import { KeyValueStorageBase, MinioService, PADLOCAL_KV_STORAGE, PrismaService } from 'src/db';
import { QueueService } from '../queue.service';
import { PadlocalMessageContentType } from 'src/padlocal/models';
import { ConfigService } from '@nestjs/config';

@Processor('newRawMessage')
export class NewRawMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewRawMessageProcessor.name);
  constructor(
    private readonly parser: MessageParserService,
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly minioSvc: MinioService,
    private readonly configService: ConfigService,
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,

  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`new raw message process: ${JSON.stringify(job.data)}`);

    const loggedInUsername = await this.kvStorage.get(
      `loggedInUser:${job.data.accountId}`,
    );

    await this.prisma.rawMessage.create({
      data: { loggedInUsername, ...job.data.rawMessage },
    });

    const newMessage = this.parser.parseMessage(job.data.rawMessage);

    if (newMessage.content.type === PadlocalMessageContentType.IMAGE) {
      const binarypayloadName = `${job.data.accountId}_${job.data.rawMessage.id}`;

      await this.minioSvc.putObject(
        this.configService.get('minio.bucketName'),
        binarypayloadName,
        newMessage.content.binarypayload,
      );

      newMessage.content.binarypayload = binarypayloadName;
    }

    await this.queueService.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
