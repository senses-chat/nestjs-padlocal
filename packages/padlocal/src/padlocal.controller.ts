import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WechatFriendshipRequest } from '@senses-chat/padlocal-db';
import { ApproveFriendRequestInput, UpdateContactRemarkInput } from './models';
import { PadlocalService } from './padlocal.service';
import { QueueService } from './queue/queue.service';

@Controller('padlocal')
export class PadlocalController {
  constructor(
    private readonly padlocalService: PadlocalService,
    private readonly queueService: QueueService,
  ) {}

  @Get('/:accountId/contacts/sync')
  async syncContacts(@Param('accountId') accountId: string): Promise<string> {
    await this.padlocalService.syncContacts(Number(accountId));
    return 'OK';
  }

  @Get('/:accountId/friend_requests')
  async getFriendRequests(
    @Param('accountId') accountId: string,
  ): Promise<WechatFriendshipRequest[]> {
    return this.padlocalService.getFriendshipRequests(Number(accountId));
  }

  @Post('/:accountId/friend_requests/approve')
  async approveFriendRequest(
    @Param('accountId') accountId: string,
    @Body() input: ApproveFriendRequestInput,
  ): Promise<string> {
    // await this.padlocalService.approveFriendshipRequest(
    //   Number(accountId),
    //   input.id,
    // );
    await this.queueService.commonAdd('approveFriendRequests', {
      accountId: Number(accountId),
      input: { id: input.id },
    });

    return 'Approved';
  }

  @Post('/:accountId/contacts/:username/update_remark')
  async updateContactRemark(
    @Param('accountId') accountId: string,
    @Param('username') username: string,
    @Body() input: UpdateContactRemarkInput,
  ): Promise<string> {
    // await this.padlocalService.updateContactRemark(
    //   Number(accountId),
    //   username,
    //   input.remark,
    // );
    await this.queueService.commonAdd('updateRemark', {
      accountId: Number(accountId),
      username,
      input: { remark: input.remark },
    });
    return 'Remark Updated';
  }

  @Post('/test')
  async transcode(): Promise<string> {
    this.queueService.commonAdd('test', { test: 1 });
    return 'test';
  }
}
