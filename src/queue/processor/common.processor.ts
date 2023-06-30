import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { PadlocalService } from '../../padlocal/padlocal.service';
import { QUEUES } from '../config';

@Processor('common', QUEUES.commonWorkerOptions)
export class CommonProcessor extends WorkerHost {
  private readonly logger = new Logger(CommonProcessor.name);
  constructor(private readonly padlocalService: PadlocalService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.verbose(
      `common process (${job.name}): ${JSON.stringify(job.data)}`,
    );

    switch (job.name) {
      case 'approveFriendRequests':
        {
          await this.padlocalService.approveFriendshipRequest(
            Number(job.data.accountId),
            job.data.input.id,
          );
        }
        break;
      case 'updateRemark':
        {
          await this.padlocalService.updateContactRemark(
            Number(job.data.accountId),
            job.data.input.username,
            job.data.input.remark,
          );
        }
        break;
      case 'addChatRoomMember':
        {
          await this.padlocalService.addChatRoomMember(
            Number(job.data.accountId),
            job.data.input.roomId,
            job.data.input.username,
          );
        }
        break;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
