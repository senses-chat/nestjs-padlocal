import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from '@senses-chat/padlocal-db';

@Processor('syncContact')
export class SyncContactProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncContactProcessor.name);
  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const loggedInUsername = await this.kvStorage.get(
      `loggedInUser:${job.data.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${job.data.accountId} is not logged in`);
    }

    await this.prisma.wechatContact.upsert({
      where: {
        sourceUsername_username: {
          sourceUsername: loggedInUsername,
          username: job.data.contact.username,
        },
      },
      update: {
        ...job.data.contact,
      },
      create: {
        sourceUsername: loggedInUsername,
        ...job.data.contact,
      },
    });

    this.logger.verbose(`sync contact process: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
