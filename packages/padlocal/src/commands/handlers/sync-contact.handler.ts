import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from '@senses-chat/wechat-db';

import { PadlocalSyncContactCommand } from '../sync-contact.command';

@CommandHandler(PadlocalSyncContactCommand)
export class PadlocalSyncContactCommandHandler
  implements ICommandHandler<PadlocalSyncContactCommand, void>
{
  private logger = new Logger(PadlocalSyncContactCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: PadlocalSyncContactCommand): Promise<void> {
    const loggedInUsername = await this.kvStorage.get(
      `loggedInUser:${command.accountId}`,
    );

    if (!loggedInUsername) {
      throw new Error(`Account ${command.accountId} is not logged in`);
    }

    await this.prisma.wechatContact.upsert({
      where: {
        sourceUsername_username: {
          sourceUsername: loggedInUsername,
          username: command.contact.username,
        },
      },
      update: {
        ...command.contact,
      },
      create: {
        sourceUsername: loggedInUsername,
        ...command.contact,
      },
    });

    this.logger.verbose(`sync contact command: ${JSON.stringify(command)}`);
  }
}
