import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from '@senses-chat/wechat-db';
import { LoginStatus } from '../../models';

import { PadlocalKickoutCommand } from '../kickout.command';

@CommandHandler(PadlocalKickoutCommand)
export class PadlocalKickoutCommandHandler
  implements ICommandHandler<PadlocalKickoutCommand, void>
{
  private logger = new Logger(PadlocalKickoutCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {}

  async execute(command: PadlocalKickoutCommand): Promise<void> {
    this.kvStorage.set(
      `loginStatus:${command.accountId}`,
      LoginStatus.LOGGED_OUT,
    );

    this.logger.verbose(`kickout command: ${JSON.stringify(command)}`);
  }
}
