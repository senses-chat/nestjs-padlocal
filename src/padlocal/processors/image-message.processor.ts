import { ConfigService } from '@nestjs/config';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ImageType } from 'padlocal-client-ts/dist/proto/padlocal_pb';

import { RedisService } from '~/modules/redis';
import { MinioService } from '~/modules/minio';

import { IMAGE_MESSAGE, NEW_MESSAGE } from '../queues';
import { PadlocalService } from '../padlocal.service';

@Processor(IMAGE_MESSAGE, {
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 1000,
  },
})
export class ImageMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageMessageProcessor.name);
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

    this.bucketName = this.configService.get<string>('minio.bucketName');
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`image message process: ${JSON.stringify(job.data)}`);

    const { rawMessage, newMessage } = job.data;

    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    const binarypayloadName = `${loggedInUsername}/images/${rawMessage.id}.jpg`;

    let content = rawMessage.content;
    if (job.data.rawMessage.fromusername.includes('@chatroom')) {
      content = content.slice(content.indexOf('<msg>'));
    }

    const imageHD = await this.padlocalService.getMessageImage(
      job.data.accountId,
      content,
      job.data.rawMessage.tousername,
      ImageType.HD,
    );

    await this.minioService.putObject(
      this.configService.get('minio.bucketName'),
      `padlocal/${binarypayloadName}`,
      Buffer.from(imageHD.imageData),
    );

    newMessage.content.binarypayload = `s3://${this.bucketName}/padlocal/${binarypayloadName}`;

    return this.newMessageQueue.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }
}
