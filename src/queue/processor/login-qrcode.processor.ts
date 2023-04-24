import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from 'src/db';
import { QRCodeStatus } from 'padlocal-client-ts/dist/proto/padlocal_pb';
import { LoginStatus } from '../../padlocal/models';

@Processor('loginQrcode')
export class LoginQrcodeProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginQrcodeProcessor.name);
  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.kvStorage.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.QRCODE,
    );

    if (job.data.qrCodeEvent.status === QRCodeStatus.NEW) {
      await this.kvStorage.set(
        `loginQRCode:${job.data.accountId}`,
        job.data.qrCodeEvent.imageurl,
        job.data.qrCodeEvent.expireat,
      );
    }

    this.logger.verbose(`login qrcode process: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
