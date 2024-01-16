import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { DrizzleService } from '~/modules/drizzle';
import { wechatContact } from '~/modules/drizzle/schema';
import { RedisService } from '~/modules/redis';

import { SYNC_CONTACT } from '../queues';

@Processor(SYNC_CONTACT)
export class SyncContactProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncContactProcessor.name);
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const loggedInUsername = await this.redisService.client.get(
      `loggedInUser:${job.data.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${job.data.accountId} is not logged in`);
    }

    await this.drizzleService.db
      .insert(wechatContact)
      .values({
        sourceUsername: loggedInUsername,
        username: job.data.contact.username,
        nickname: job.data.contact.nickname,
        avatar: job.data.contact.avatar,
        gender: job.data.contact.gender,
        signature: job.data.contact.signature,
        alias: job.data.contact.alias,
        label: job.data.contact.label,
        remark: job.data.contact.remark,
        city: job.data.contact.city,
        province: job.data.contact.province,
        country: job.data.contact.country,
        contactAddScene: job.data.contact.contactaddscene,
        stranger: job.data.contact.stranger,
        encryptUsername: job.data.contact.encryptusername,
        phoneList: job.data.contact.phoneList,
        chatroomOwnerUsername: job.data.contact.chatroomownerusername,
        chatroomMaxCount: job.data.contact.chatroommaxcount,
        chatroomMemberList: job.data.contact.chatroommemberList,
      })
      .onConflictDoUpdate({
        target: [wechatContact.sourceUsername, wechatContact.username],
        set: {
          username: job.data.contact.username,
          nickname: job.data.contact.nickname,
          avatar: job.data.contact.avatar,
          gender: job.data.contact.gender,
          signature: job.data.contact.signature,
          alias: job.data.contact.alias,
          label: job.data.contact.label,
          remark: job.data.contact.remark,
          city: job.data.contact.city,
          province: job.data.contact.province,
          country: job.data.contact.country,
          contactAddScene: job.data.contact.contactaddscene,
          stranger: job.data.contact.stranger,
          encryptUsername: job.data.contact.encryptusername,
          phoneList: job.data.contact.phoneList,
          chatroomOwnerUsername: job.data.contact.chatroomownerusername,
          chatroomMaxCount: job.data.contact.chatroommaxcount,
          chatroomMemberList: job.data.contact.chatroommemberList,
        },
      });

    this.logger.verbose(`sync contact process: ${JSON.stringify(job.data)}`);
  }
}
