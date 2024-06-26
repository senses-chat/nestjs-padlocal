import { ConfigService } from '@nestjs/config';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { decode, decodeResult as DecodeResult } from 'silk-wasm';
import { WaveFile } from 'wavefile';

import { RedisService } from '~/modules/redis';
import { MinioService } from '~/modules/minio';

import { NEW_MESSAGE, VOICE_MESSAGE } from '../queues';
import { PadlocalService } from '../padlocal.service';

@Processor(VOICE_MESSAGE, {
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 1000,
  },
})
export class VoiceMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(VoiceMessageProcessor.name);
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
    this.logger.log(`voice message process: ${JSON.stringify(job.data)}`);
    const { rawMessage, newMessage } = job.data;

    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    const binarypayloadName = `${loggedInUsername}/voices/${job.data.rawMessage.id}.wav`;

    let content = rawMessage.content;
    if (job.data.rawMessage.fromusername.includes('@chatroom')) {
      content = content.slice(content.indexOf('<msg>'));
    }

    const voiceData = await this.padlocalService.getMessageVoice(
      job.data.accountId,
      job.data.rawMessage.id,
      content,
      job.data.rawMessage.tousername,
    );

    const decodeResult: DecodeResult = await decode(voiceData, this.sampleRate);

    // convert the pcm uint8array into s16le array.
    const pcmData = new Int16Array(decodeResult.data.length / 2);
    for (let i = 0; i < pcmData.length; i++) {
      pcmData[i] =
        decodeResult.data[i * 2] + (decodeResult.data[i * 2 + 1] << 8);
    }
    const wavFile = new WaveFile();
    wavFile.fromScratch(1, this.sampleRate, '16', pcmData);

    await this.minioService.putObject(
      this.configService.get('padlocal.assetsBucketName'),
      `padlocal/${binarypayloadName}`,
      Buffer.from(wavFile.toBuffer()),
    );

    newMessage.content.binarypayload = `s3://${this.bucketName}/padlocal/${binarypayloadName}`;
    newMessage.content.duration = decodeResult.duration;

    return this.newMessageQueue.add('newMessage', {
      accountId: job.data.accountId,
      message: newMessage,
    });
  }
}
