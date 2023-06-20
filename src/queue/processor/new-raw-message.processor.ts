import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { MessageParserService } from '../../padlocal/parser.service';
import {
  KeyValueStorageBase,
  MinioService,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from 'src/db';
import { QueueService } from '../queue.service';
import { PadlocalService } from '../../padlocal/padlocal.service';
import { PadlocalMessageContentType } from 'src/padlocal/models';
import { ImageType } from "padlocal-client-ts/dist/proto/padlocal_pb";
import { ConfigService } from '@nestjs/config';

@Processor('newRawMessage')
export class NewRawMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewRawMessageProcessor.name);
  constructor(
    private readonly padlocalService: PadlocalService,
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

    await this.prisma.rawMessage.upsert({
      where: { id: job.data.rawMessage.id },
      create: { loggedInUsername, ...job.data.rawMessage },
      update: { loggedInUsername, ...job.data.rawMessage },
    });

    const newMessage = this.parser.parseMessage(job.data.rawMessage);

    if (newMessage.content.type === PadlocalMessageContentType.IMAGE && newMessage.content.binarypayload) {
      const binarypayloadName = `${loggedInUsername}/${job.data.rawMessage.id}.jpg`;
      const imageHD = await this.padlocalService.getMessageImage(job.data.accountId, job.data.rawMessage.content, job.data.rawMessage.tousername, ImageType.HD)

      await this.minioSvc.putObject(
        this.configService.get('minio.bucketName'),
        `padlocal/${binarypayloadName}`,
        new Buffer(imageHD.imageData)
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
