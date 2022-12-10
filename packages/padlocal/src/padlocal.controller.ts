import { Controller, Get, Param } from '@nestjs/common';
import { WechatFriendshipRequest } from '@senses-chat/padlocal-db';

import { PadlocalService } from './padlocal.service';

@Controller('padlocal')
export class PadlocalController {
  constructor(
    private readonly padlocalService: PadlocalService,
  ) {}

  @Get('/:accountId/contacts/sync')
  async syncContacts(@Param('accountId') accountId: string): Promise<string> {
    await this.padlocalService.syncContacts(Number(accountId));
    return 'OK';
  }

  @Get('/:accountId/friend_requests')
  async getFriendRequests(@Param('accountId') accountId: string): Promise<WechatFriendshipRequest[]> {
    return this.padlocalService.getFriendshipRequests(Number(accountId));
  }
}
