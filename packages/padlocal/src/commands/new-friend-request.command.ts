import { ICommand } from '@nestjs/cqrs';

import { PadlocalFriendshipRequestMessageContent } from '../models';

export class PadlocalNewFriendRequestCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly friendRequest: PadlocalFriendshipRequestMessageContent,
  ) {}
}
