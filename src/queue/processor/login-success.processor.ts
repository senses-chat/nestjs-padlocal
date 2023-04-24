import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from 'src/db';
import { LoginStatus } from '../../padlocal/models';
import { QueueService } from '../queue.service';

@Processor('loginSuccess')
export class LoginSuccessProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginSuccessProcessor.name);
  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.kvStorage.set(
      `loginStatus:${job.data.accountId}`,
      LoginStatus.LOGGED_IN,
    );

    await this.kvStorage.set(
      `loggedInUser:${job.data.accountId}`,
      job.data.contactSelf.username,
    );

    // sync self contact
    await this.queueService.add('syncContact', {
      accountId: job.data.accountId,
      contact: job.data.contactSelf,
    });

    this.logger.verbose(`login success process: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
