import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from '@senses-chat/wechat-db';
import { LoginStatus } from '../../models';

import { PadlocalLoginSuccessCommand } from '../login-success.command';

@CommandHandler(PadlocalLoginSuccessCommand)
export class PadlocalLoginSuccessCommandHandler
  implements ICommandHandler<PadlocalLoginSuccessCommand, void>
{
  private logger = new Logger(PadlocalLoginSuccessCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {}

  async execute(command: PadlocalLoginSuccessCommand): Promise<void> {
    this.kvStorage.set(
      `loginStatus:${command.accountId}`,
      LoginStatus.LOGGED_IN,
    );

    this.kvStorage.set(
      `loggedInUser:${command.accountId}`,
      command.contactSelf.username,
    );

    this.logger.verbose(`login success command: ${JSON.stringify(command)}`);
  }
}
