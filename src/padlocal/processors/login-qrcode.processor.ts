import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QRCodeStatus } from 'padlocal-client-ts/dist/proto/padlocal_pb';

import { RedisService } from '~/modules/redis';

import { LoginStatus } from '../models';
import { LOGIN_QR_CODE } from '../queues';

@Processor(LOGIN_QR_CODE, {
  concurrency: 1,
})
export class LoginQrcodeProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginQrcodeProcessor.name);
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.redisService.client.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.QRCODE,
    );

    if (job.data.qrCodeEvent.status === QRCodeStatus.NEW) {
      await this.redisService.client.set(
        `loginQRCode:${job.data.accountId}`,
        job.data.qrCodeEvent.imageurl,
        job.data.qrCodeEvent.expireat,
      );
    }

    this.logger.verbose(`login qrcode process: ${JSON.stringify(job.data)}`);
  }
}
