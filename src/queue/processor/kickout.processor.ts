import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from 'src/db';
import { LoginStatus } from '../../padlocal/models';

@Processor('kickout')
export class KickoutProcessor extends WorkerHost {
  private readonly logger = new Logger(KickoutProcessor.name);
  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.kvStorage.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.LOGGED_OUT,
    );

    this.logger.verbose(`kickout process: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
