import { Controller, Get, Param } from '@nestjs/common';

// import {
//   ApproveFriendRequestInput,
//   UpdateContactRemarkInput,
//   SendVoiceMessageInput,
// } from './models';
import { PadlocalService } from './padlocal.service';

@Controller('padlocal')
export class PadlocalController {
  constructor(private readonly padlocalService: PadlocalService) {}

  @Get('/:accountId/contacts/sync')
  async syncContacts(@Param('accountId') accountId: string): Promise<string> {
    await this.padlocalService.syncContacts(Number(accountId));
    return 'OK';
  }

  @Get('/:accountId/friend_requests')
  async getFriendRequests(
    @Param('accountId') accountId: string,
  ): Promise<any[]> {
    return this.padlocalService.getFriendshipRequests(Number(accountId));
  }

  // @Post('/:accountId/friend_requests/process')
  // async processFriendRequest(
  //   @Param('accountId') accountId: string,
  //   @Body() input: ApproveFriendRequestInput,
  // ): Promise<string> {
  //   await this.queueService.add('friendRequest', {
  //     accountId: Number(accountId),
  //     requestId: input.id,
  //   });

  //   return 'Processing';
  // }

  // @Post('/:accountId/friend_requests/approve')
  // async approveFriendRequest(
  //   @Param('accountId') accountId: string,
  //   @Body() input: ApproveFriendRequestInput,
  // ): Promise<string> {
  //   await this.queueService.commonAdd('approveFriendRequests', {
  //     accountId: Number(accountId),
  //     input: { id: input.id },
  //   });

  //   return 'Approved';
  // }

  // @Post('/:accountId/contacts/:username/update_remark')
  // async updateContactRemark(
  //   @Param('accountId') accountId: string,
  //   @Param('username') username: string,
  //   @Body() input: UpdateContactRemarkInput,
  // ): Promise<string> {
  //   await this.queueService.commonAdd('updateRemark', {
  //     accountId: Number(accountId),
  //     input: { username, remark: input.remark },
  //   });
  //   return 'Remark Updated';
  // }

  // @Post('/:accountId/message/:username/voice')
  // async sendVoiceMessage(
  //   @Param('accountId') accountId: string,
  //   @Param('username') username: string,
  //   @Body() input: SendVoiceMessageInput,
  // ): Promise<string> {
  //   await this.queueService.commonAdd('sendMessageVoice', {
  //     accountId: Number(accountId),
  //     username,
  //     input,
  //   });
  //   return 'Sended Voice Message';
  // }
}
