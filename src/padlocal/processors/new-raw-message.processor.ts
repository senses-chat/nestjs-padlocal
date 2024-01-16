import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageType } from 'padlocal-client-ts/dist/proto/padlocal_pb';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

import { RedisService } from '~/modules/redis';
import { DrizzleService } from '~/modules/drizzle';
import { MinioService } from '~/modules/minio';
import { rawMessage } from '~/modules/drizzle/schema';

import { PadlocalMessageContentType } from '../models';
import { NEW_MESSAGE, NEW_RAW_MESSAGE } from '../queues';
import { PadlocalService } from '../padlocal.service';
import { MessageParserService } from '../parser.service';

@Processor(NEW_RAW_MESSAGE, { concurrency: 10 })
export class NewRawMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewRawMessageProcessor.name);
  constructor(
    private readonly padlocalService: PadlocalService,
    private readonly parser: MessageParserService,
    private readonly redisService: RedisService,
    private readonly drizzleService: DrizzleService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
    @InjectQueue(NEW_MESSAGE)
    private readonly newMessageQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`new raw message process: ${JSON.stringify(job.data)}`);

    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    await this.drizzleService.db
      .insert(rawMessage)
      .values({
        id: job.data.rawMessage.id,
        content: job.data.rawMessage.content,
        atList: job.data.rawMessage.atList,
        binaryPayload: job.data.rawMessage.binarypayload,
        createTime: job.data.rawMessage.createtime,
        fromUsername: job.data.rawMessage.fromusername,
        pushContent: job.data.rawMessage.pushcontent,
        toUsername: job.data.rawMessage.tousername,
        type: job.data.rawMessage.type,
        loggedInUsername,
      })
      .onConflictDoUpdate({
        target: rawMessage.id,
        set: {
          content: job.data.rawMessage.content,
          atList: job.data.rawMessage.atList,
          binaryPayload: job.data.rawMessage.binarypayload,
          createTime: job.data.rawMessage.createtime,
          fromUsername: job.data.rawMessage.fromusername,
          pushContent: job.data.rawMessage.pushcontent,
          toUsername: job.data.rawMessage.tousername,
          type: job.data.rawMessage.type,
          loggedInUsername,
        },
      });

    const newMessage = this.parser.parseMessage(job.data.rawMessage);

    if (
      newMessage.content.type === PadlocalMessageContentType.IMAGE &&
      job.data.rawMessage.content
    ) {
      const binarypayloadName = `${loggedInUsername}/image/${job.data.rawMessage.id}.jpg`;
      const imageHD = await this.padlocalService.getMessageImage(
        job.data.accountId,
        job.data.rawMessage.content,
        job.data.rawMessage.tousername,
        ImageType.HD,
      );

      await this.minioService.putObject(
        this.configService.get('minio.bucketName'),
        `padlocal/${binarypayloadName}`,
        Buffer.from(imageHD.imageData),
      );

      newMessage.content.binarypayload = binarypayloadName;
    }

    if (
      newMessage.content.type === PadlocalMessageContentType.VOICE &&
      job.data.rawMessage.content
    ) {
      const binarypayloadName = `${loggedInUsername}/voice/${job.data.rawMessage.id}.slk`;
      let content = job.data.rawMessage.content;
      if (job.data.rawMessage.fromusername.includes('@chatroom')) {
        content = content.slice(content.indexOf('<msg>'));
      }
      const voiceData = await this.padlocalService.getMessageVoice(
        job.data.accountId,
        job.data.rawMessage.id,
        content,
        job.data.rawMessage.tousername,
      );

      await this.minioService.putObject(
        this.configService.get('minio.bucketName'),
        `padlocal/${binarypayloadName}`,
        new Buffer(voiceData),
      );

      newMessage.content.binarypayload = binarypayloadName;
    }

    await this.newMessageQueue.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }
}
