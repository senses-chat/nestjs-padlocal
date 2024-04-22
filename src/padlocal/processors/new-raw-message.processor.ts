import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

import { RedisService } from '~/modules/redis';
import { DrizzleService } from '~/modules/drizzle';
import { rawMessage } from '~/modules/drizzle/schema';

import { PadlocalMessageContentType } from '../models';
import {
  FILE_MESSAGE,
  IMAGE_MESSAGE,
  NEW_MESSAGE,
  NEW_RAW_MESSAGE,
  VOICE_MESSAGE,
} from '../queues';
import { MessageParserService } from '../parser.service';

@Processor(NEW_RAW_MESSAGE, { concurrency: 10 })
export class NewRawMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(NewRawMessageProcessor.name);
  constructor(
    private readonly parser: MessageParserService,
    private readonly redisService: RedisService,
    private readonly drizzleService: DrizzleService,
    @InjectQueue(IMAGE_MESSAGE)
    private readonly imageMessageQueue: Queue,
    @InjectQueue(VOICE_MESSAGE)
    private readonly voiceMessageQueue: Queue,
    @InjectQueue(FILE_MESSAGE)
    private readonly fileMessageQueue: Queue,
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
      return this.imageMessageQueue.add('imageMessage', {
        accountId: job.data.accountId,
        rawMessage: job.data.rawMessage,
        newMessage,
      });
    }

    if (
      newMessage.content.type === PadlocalMessageContentType.VOICE &&
      job.data.rawMessage.content
    ) {
      return this.voiceMessageQueue.add('voiceMessage', {
        accountId: job.data.accountId,
        rawMessage: job.data.rawMessage,
        newMessage,
      });
    }

    if (
      newMessage.content.type === PadlocalMessageContentType.FILE &&
      job.data.rawMessage.content
    ) {
      return this.fileMessageQueue.add('fileMessage', {
        accountId: job.data.accountId,
        rawMessage: job.data.rawMessage,
        newMessage,
      });
    }

    return this.newMessageQueue.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }
}
