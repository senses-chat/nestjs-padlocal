import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { KickOutEvent, PadLocalClient } from 'padlocal-client-ts';
import {
  Contact,
  LoginPolicy,
  LoginType,
  Message,
  QRCodeEvent,
  SyncEvent,
} from 'padlocal-client-ts/dist/proto/padlocal_pb';

import { PrismaService } from '@senses-chat/wechat-db';
import {
  PadlocalLoginStartCommand,
  PadlocalKickoutCommand,
  PadlocalLoginQRCodeCommand,
  PadlocalLoginSuccessCommand,
} from './commands';

@Injectable()
export class PadlocalService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PadlocalService.name);
  private clients = new Map<number, PadLocalClient>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const logger = new Logger(PadlocalService.name);

    const cmdBus = this.commandBus;
    const accounts = await this.prisma.padlocalAccount.findMany();

    for (const account of accounts) {
      this.logger.debug(`Connecting to account ${account.token}`);

      const client = await PadLocalClient.create(account.token);
      this.clients.set(account.id, client);

      client.on('kickout', (kickoutEvent: KickOutEvent) => {
        cmdBus.execute(new PadlocalKickoutCommand(account.id, kickoutEvent));
      });

      client.on('message', (messageList: Message[]) => {
        for (const message of messageList) {
          logger.debug('on message: ', JSON.stringify(message.toObject()));
        }
      });

      client.on('contact', (contactList: Contact[]) => {
        for (const contact of contactList) {
          logger.debug('on contact: ', JSON.stringify(contact.toObject()));
        }
      });

      logger.debug('start login');

      await client.api.login(LoginPolicy.DEFAULT, {
        onLoginStart: (loginType: LoginType) => {
          cmdBus.execute(new PadlocalLoginStartCommand(account.id, loginType));
        },
        onOneClickEvent: (oneClickEvent: QRCodeEvent) => {
          cmdBus.execute(
            new PadlocalLoginQRCodeCommand(
              account.id,
              oneClickEvent.toObject(),
            ),
          );
        },
        onQrCodeEvent: (qrCodeEvent: QRCodeEvent) => {
          cmdBus.execute(
            new PadlocalLoginQRCodeCommand(account.id, qrCodeEvent.toObject()),
          );
        },
        onLoginSuccess: (contact: Contact) => {
          cmdBus.execute(
            new PadlocalLoginSuccessCommand(account.id, contact.toObject()),
          );
        },
        onSync: (syncEvent: SyncEvent) => {
          for (const contact of syncEvent.getContactList()) {
            logger.debug(
              'login on sync contact: ',
              JSON.stringify(contact.toObject()),
            );
          }

          for (const message of syncEvent.getMessageList()) {
            logger.debug(
              'login on sync message: ',
              JSON.stringify(message.toObject()),
            );
          }
        },
      });
    }
  }

  async onApplicationShutdown(signal?: string) {
    const clients = this.clients.values();
    this.logger.debug(`Shutting down all running padlocal clients`);
    for (const client of clients) {
      await client.shutdown();
    }
  }
}
