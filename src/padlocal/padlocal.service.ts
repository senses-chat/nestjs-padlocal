import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { KickOutEvent, PadLocalClient } from 'padlocal-client-ts';
import {
  Contact,
  LoginPolicy,
  LoginType,
  Message,
  QRCodeEvent,
  SyncEvent,
  ImageType,
} from 'padlocal-client-ts/dist/proto/padlocal_pb';

import {
  KeyValueStorageBase,
  PADLOCAL_KV_STORAGE,
  PrismaService,
} from 'src/db';
import { QueueService } from '../queue/queue.service';

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
    private readonly queueService: QueueService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const accounts = await this.prisma.padlocalAccount.findMany();

      for (const account of accounts) {
        this.logger.debug(
          `Initializing padlocal account ${account.id} (${account.token})`,
        );

        const client = await PadLocalClient.create(account.token, true);
        this.clients.set(account.id, client);

        client.on('kickout', (kickoutEvent: KickOutEvent) => {
          this.queueService.add('kickout', {
            accountId: account.id,
            kickoutEvent,
          });
        });

        client.on('message', (messageList: Message[]) => {
          for (const message of messageList) {
            this.queueService.add('newRawMessage', {
              accountId: account.id,
              rawMessage: message.toObject(),
            });
          }
        });

        client.on('contact', (contactList: Contact[]) => {
          for (const contact of contactList) {
            this.queueService.add('syncContact', {
              accountId: account.id,
              contact: contact.toObject(),
            });
          }
        });

        await client.api.login(LoginPolicy.DEFAULT, {
          onLoginStart: (loginType: LoginType) => {
            this.queueService.add('loginStart', {
              accountId: account.id,
              loginType,
            });
          },
          onOneClickEvent: (oneClickEvent: QRCodeEvent) => {
            this.queueService.add('loginQrcode', {
              accountId: account.id,
              qrCodeEvent: oneClickEvent.toObject(),
            });
          },
          onQrCodeEvent: (qrCodeEvent: QRCodeEvent) => {
            this.queueService.add('loginQrcode', {
              accountId: account.id,
              qrCodeEvent: qrCodeEvent.toObject(),
            });
          },
          onLoginSuccess: (contact: Contact) => {
            this.queueService.add('loginSuccess', {
              accountId: account.id,
              contactSelf: contact.toObject(),
            });
          },
          onSync: (syncEvent: SyncEvent) => {
            for (const contact of syncEvent.getContactList()) {
              this.queueService.add('syncContact', {
                accountId: account.id,
                contact: contact.toObject(),
              });
            }

            for (const message of syncEvent.getMessageList()) {
              this.queueService.add('newRawMessage', {
                accountId: account.id,
                rawMessage: message.toObject(),
              });
            }
          },
        });
      }
    } catch (err) {
      console.log('==============err', err);
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
          this.queueService.add('syncContact', {
            accountId,
            contact: contact.toObject(),
          });
        }
      },
    });
  }

  // TODO: output type
  public async getFriendshipRequests(accountId: number): Promise<any[]> {
    const username = await this.getLoggedInWechatUsername(accountId);

    if (!username) {
      throw new Error(`Logged in user for account ${accountId} not found`);
    }

    return this.prisma.wechatFriendshipRequest.findMany({
      select: {
        id: true,
        username: true,
        nickname: true,
        requestMessage: true,
        scene: true,
        avatar: true,
        gender: true,
        alias: true,
        city: true,
        province: true,
        country: true,
        createdAt: true,
      },
      where: {
        sourceUsername: username,
      },
    });
  }

  public async approveFriendshipRequest(
    accountId: number,
    friendshipRequestId: number,
  ): Promise<void> {
    const username = await this.getLoggedInWechatUsername(accountId);

    if (!username) {
      throw new Error(`Logged in user for account ${accountId} not found`);
    }

    const friendshipRequest =
      await this.prisma.wechatFriendshipRequest.findFirst({
        where: {
          id: friendshipRequestId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!friendshipRequest || friendshipRequest.sourceUsername !== username) {
      throw new Error('Invalid friendship request');
    }

    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    await client.api.acceptUser(
      friendshipRequest.username,
      friendshipRequest.ticket,
      friendshipRequest.encryptUsername,
      friendshipRequest.scene,
    );

    // remove all friendship requests with the same person
    await this.prisma.wechatFriendshipRequest.deleteMany({
      where: {
        sourceUsername: friendshipRequest.sourceUsername,
        username: friendshipRequest.username,
      },
    });
  }

  public async updateContactRemark(
    accountId: number,
    username: string,
    remark: string,
  ): Promise<void> {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.updateContactRemark(username, remark);
  }

  public async getMessageImage(
    accountId: number,
    messageContent: string,
    messageToUserName: string,
    imageType: ImageType
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.getMessageImage(messageContent, messageToUserName, imageType);
  }

  public async getMessageVoice(
    accountId: number,
    messageId: string,
    messageContent: string,
    messageToUserName: string,
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }
    
    return client.api.getMessageVoice(messageId, messageContent, messageToUserName);
  }

  public async getLoggedInWechatUsername(accountId: number): Promise<string> {
    return this.kvStorage.get(`loggedInUser:${accountId}`);
  }

  async onApplicationShutdown(signal?: string) {
    const clients = this.clients.values();
    this.logger.debug(`Shutting down all running padlocal clients`);
    for (const client of clients) {
      await client.shutdown();
    }
  }
}
