import { ConfigService } from '@nestjs/config';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

import { RedisService } from '~/modules/redis';
import { MinioService } from '~/modules/minio';

import { NEW_MESSAGE, FILE_MESSAGE } from '../queues';
import { PadlocalService } from '../padlocal.service';

@Processor(FILE_MESSAGE, {
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 1000,
  },
})
export class FileMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(FileMessageProcessor.name);
  private readonly sampleRate = 24000;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly minioService: MinioService,
    private readonly padlocalService: PadlocalService,
    @InjectQueue(NEW_MESSAGE)
    private readonly newMessageQueue: Queue,
  ) {
    super();

    this.bucketName = this.configService.get<string>(
      'padlocal.assetsBucketName',
    );
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`file message process: ${JSON.stringify(job.data)}`);
    const { rawMessage, newMessage } = job.data;

    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    const binarypayloadName = `${loggedInUsername}/files/${
      job.data.rawMessage.id
    }.${
      job.data.newMessage.appAttachPayload?.fileext ??
      job.data.newMessage.content.title.split('.').pop()
    }`;

    let content = rawMessage.content;
    if (job.data.rawMessage.fromusername.includes('@chatroom')) {
      content = content.slice(content.indexOf('<msg>'));
    }

    const buffer = await this.padlocalService.getMessageAttach(
      job.data.accountId,
      content,
      job.data.rawMessage.tousername,
    );

    await this.minioService.putObject(
      this.configService.get('padlocal.assetsBucketName'),
      `padlocal/${binarypayloadName}`,
      buffer,
    );

    newMessage.content.url = `s3://${this.bucketName}/padlocal/${binarypayloadName}`;

    return this.newMessageQueue.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }
}
