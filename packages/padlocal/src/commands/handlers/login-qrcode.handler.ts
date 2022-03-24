import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
} from '@senses-chat/wechat-db';
import { QRCodeStatus } from 'padlocal-client-ts/dist/proto/padlocal_pb';
import { LoginStatus } from '../../models';

import { PadlocalLoginQRCodeCommand } from '../login-qrcode.command';

@CommandHandler(PadlocalLoginQRCodeCommand)
export class PadlocalLoginQRCodeCommandHandler
  implements ICommandHandler<PadlocalLoginQRCodeCommand, void>
{
  private logger = new Logger(PadlocalLoginQRCodeCommandHandler.name);

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
  ) {}

  async execute(command: PadlocalLoginQRCodeCommand): Promise<void> {
    this.kvStorage.set(`loginStatus:${command.accountId}`, LoginStatus.QRCODE);

    if (command.qrCodeEvent.status === QRCodeStatus.NEW) {
      this.kvStorage.set(
        `loginQRCode:${command.accountId}`,
        command.qrCodeEvent.imageurl,
        command.qrCodeEvent.expireat,
      );
    }

    this.logger.verbose(`login qrcode command: ${JSON.stringify(command)}`);
  }
}
