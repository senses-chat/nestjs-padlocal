import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from '@senses-chat/padlocal-db';
import { LoginStatus } from '../../models';

import { PadlocalLoginStartCommand } from '../login-start.command';

@CommandHandler(PadlocalLoginStartCommand)
export class PadlocalLoginStartCommandHandler
  implements ICommandHandler<PadlocalLoginStartCommand, void>
{
  private logger = new Logger(PadlocalLoginStartCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {}

  async execute(command: PadlocalLoginStartCommand): Promise<void> {
    await this.kvStorage.set(
      `loginStatus:${command.accountId}`,
      LoginStatus.LOGIN_START,
    );

    this.logger.verbose(`login start command: ${JSON.stringify(command)}`);
  }
}
