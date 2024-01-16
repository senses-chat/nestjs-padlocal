import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { ACTIONS } from '../queues';
import { PadlocalService } from '../padlocal.service';

@Processor(ACTIONS, {
  concurrency: 1,
  // rate limit
  limiter: {
    max: 1,
    duration: 2000,
  },
})
export class ActionsProcessor extends WorkerHost {
  private readonly logger = new Logger(ActionsProcessor.name);
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
      case 'sendMessageVoice':
        {
          await this.padlocalService.sendMessageVoice(
            Number(job.data.accountId),
            job.data.username,
            job.data.input.voiceS3Path,
            job.data.input.voiceLength,
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
}
