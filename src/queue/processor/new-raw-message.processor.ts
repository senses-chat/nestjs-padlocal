import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { ImageType } from 'padlocal-client-ts/dist/proto/padlocal_pb';

import {
  KeyValueStorageBase,
  MinioService,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from 'src/db';
import {
  PadlocalService,
  MessageParserService,
  PadlocalMessageContentType,
} from 'src/padlocal';
import { QueueService } from '../queue.service';

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

    if (newMessage.content.type === PadlocalMessageContentType.IMAGE && job.data.rawMessage.content) {
      const binarypayloadName = `${loggedInUsername}/image/${job.data.rawMessage.id}.jpg`;
      const imageHD = await this.padlocalService.getMessageImage(job.data.accountId, job.data.rawMessage.content, job.data.rawMessage.tousername, ImageType.HD)

      await this.minioSvc.putObject(
        this.configService.get('minio.bucketName'),
        `padlocal/${binarypayloadName}`,
        Buffer.from(imageHD.imageData),
      );

      newMessage.content.binarypayload = binarypayloadName;
    }

    if (newMessage.content.type === PadlocalMessageContentType.VOICE && job.data.rawMessage.content) {
      const binarypayloadName = `${loggedInUsername}/voice/${job.data.rawMessage.id}.slk`;
      let content = job.data.rawMessage.content;
      if (job.data.rawMessage.fromusername.includes('@chatroom')) {
        content = content.slice(content.indexOf('<msg>'));
      }
      const voiceData = await this.padlocalService.getMessageVoice(job.data.accountId, job.data.rawMessage.id, content, job.data.rawMessage.tousername)

      await this.minioSvc.putObject(
        this.configService.get('minio.bucketName'),
        `padlocal/${binarypayloadName}`,
        new Buffer(voiceData)
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
