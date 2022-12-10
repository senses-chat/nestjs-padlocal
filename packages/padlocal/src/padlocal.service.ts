import {
  Inject,
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

import { KeyValueStorageBase, PADLOCAL_KV_STORAGE, PrismaService, WechatFriendshipRequest } from '@senses-chat/padlocal-db';
import {
  PadlocalLoginStartCommand,
  PadlocalKickoutCommand,
  PadlocalLoginQRCodeCommand,
  PadlocalLoginSuccessCommand,
  PadlocalSyncContactCommand,
  PadlocalNewRawMessageCommand,
} from './commands';

@Injectable()
export class PadlocalService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PadlocalService.name);
  private clients = new Map<number, PadLocalClient>();

  constructor(
    @Inject(PADLOCAL_KV_STORAGE)
    private readonly kvStorage: KeyValueStorageBase,
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const cmdBus = this.commandBus;
    const accounts = await this.prisma.padlocalAccount.findMany();

    for (const account of accounts) {
      this.logger.debug(
        `Initializing padlocal account ${account.id} (${account.token})`,
      );

      const client = await PadLocalClient.create(account.token, true);
      this.clients.set(account.id, client);

      client.on('kickout', (kickoutEvent: KickOutEvent) => {
        cmdBus.execute(new PadlocalKickoutCommand(account.id, kickoutEvent));
      });

      client.on('message', (messageList: Message[]) => {
        for (const message of messageList) {
          cmdBus.execute(
            new PadlocalNewRawMessageCommand(account.id, message.toObject()),
          );
        }
      });

      client.on('contact', (contactList: Contact[]) => {
        for (const contact of contactList) {
          cmdBus.execute(
            new PadlocalSyncContactCommand(account.id, contact.toObject()),
          );
        }
      });

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
            cmdBus.execute(
              new PadlocalSyncContactCommand(account.id, contact.toObject()),
            );
          }

          for (const message of syncEvent.getMessageList()) {
            cmdBus.execute(
              new PadlocalNewRawMessageCommand(account.id, message.toObject()),
            );
          }
        },
      });
    }
  }

  public async syncContacts(accountId: number): Promise<void> {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    await client.api.syncContact({
      onSync: (contactList: Contact[]) => {
        for (const contact of contactList) {
          this.commandBus.execute(
            new PadlocalSyncContactCommand(accountId, contact.toObject()),
          );
        }
      },
    });
  }

  public async getFriendshipRequests(accountId: number): Promise<WechatFriendshipRequest[]> {
    const username = await this.getLoggedInWechatUsername(accountId);

    if (!username) {
      throw new Error(`Logged in user for account ${accountId} not found`);
    }

    return this.prisma.wechatFriendshipRequest.findMany({
      where: {
        sourceUsername: username,
      },
    });
  }

  public async getLoggedInWechatUsername(accountId: number): Promise<string> {
    return this.kvStorage.get(
      `loggedInUser:${accountId}`,
    );
  }

  async onApplicationShutdown(signal?: string) {
    const clients = this.clients.values();
    this.logger.debug(`Shutting down all running padlocal clients`);
    for (const client of clients) {
      await client.shutdown();
    }
  }
}
