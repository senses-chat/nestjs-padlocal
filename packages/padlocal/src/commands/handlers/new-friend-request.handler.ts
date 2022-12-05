import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KeyValueStorageBase, PADLOCAL_KV_STORAGE, PrismaService } from '@senses-chat/padlocal-db';

import { PadlocalNewFriendRequestCommand } from '../new-friend-request.command';

@CommandHandler(PadlocalNewFriendRequestCommand)
export class PadlocalNewFriendRequestCommandHandler
  implements ICommandHandler<PadlocalNewFriendRequestCommand, void>
{
  private logger = new Logger(PadlocalNewFriendRequestCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: PadlocalNewFriendRequestCommand): Promise<void> {
    const loggedInUsername = await this.kvStorage.get(
      `loggedInUser:${command.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${command.accountId} is not logged in`);
    }

    await this.prisma.wechatFriendshipRequest.create({
      data: {
        sourceUsername: loggedInUsername,
        username: command.friendRequest.fromUsername,
        encryptUsername: command.friendRequest.encryptUsername,
        nickname: command.friendRequest.nickname,
        ticket: command.friendRequest.ticket,
        requestMessage: command.friendRequest.requestMessage,
        scene: command.friendRequest.scene,
        avatar: command.friendRequest.avatar,
        gender: command.friendRequest.gender,
        alias: command.friendRequest.alias,
        city: command.friendRequest.city,
        province: command.friendRequest.province,
        country: command.friendRequest.country,
        payload: command.friendRequest.payload,
      },
    });

    this.logger.verbose(`new friend request command: ${JSON.stringify(command)}`);
  }
}
