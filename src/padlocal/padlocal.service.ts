import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { v4 as uuid } from 'uuid';
import { Queue } from 'bullmq';
import { KickOutEvent, PadLocalClient } from 'padlocal-client-ts';
import {
  Contact,
  LoginPolicy,
  LoginType,
  Message,
  QRCodeEvent,
  SyncEvent,
  ImageType,
  AddChatRoomMemberType,
} from 'padlocal-client-ts/dist/proto/padlocal_pb';
import { and, eq } from 'drizzle-orm';

import { RedisService } from '~/modules/redis';
import { MinioService } from '~/modules/minio';
import { DrizzleService } from '~/modules/drizzle';
import {
  padlocalAccount,
  wechatFriendshipRequest,
} from '~/modules/drizzle/schema';

import {
  KICK_OUT,
  LOGIN_QR_CODE,
  LOGIN_START,
  LOGIN_SUCCESS,
  NEW_RAW_MESSAGE,
  SYNC_CONTACT,
} from './queues';

@Injectable()
export class PadlocalService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PadlocalService.name);
  private clients = new Map<number, PadLocalClient>();

  private db = this.drizzleService.db;

  constructor(
    private readonly redisService: RedisService,
    private readonly minio: MinioService,
    private readonly drizzleService: DrizzleService,
    private readonly configService: ConfigService,
    @InjectQueue(KICK_OUT)
    private readonly kickOutQueue: Queue,
    @InjectQueue(NEW_RAW_MESSAGE)
    private readonly newRawMessageQueue: Queue,
    @InjectQueue(SYNC_CONTACT)
    private readonly syncContactQueue: Queue,
    @InjectQueue(LOGIN_START)
    private readonly loginStartQueue: Queue,
    @InjectQueue(LOGIN_QR_CODE)
    private readonly loginQrCodeQueue: Queue,
    @InjectQueue(LOGIN_SUCCESS)
    private readonly loginSuccessQueue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const accounts = await this.db.select().from(padlocalAccount);

    for (const account of accounts) {
      this.logger.debug(
        `Initializing padlocal account ${account.id} (${account.token})`,
      );

      const client = await PadLocalClient.create(account.token, true);
      this.clients.set(account.id, client);

      client.on('kickout', (kickoutEvent: KickOutEvent) => {
        this.kickOutQueue.add('kickout', {
          accountId: account.id,
          kickoutEvent,
        });
      });

      client.on('message', (messageList: Message[]) => {
        for (const message of messageList) {
          this.newRawMessageQueue.add('newRawMessage', {
            accountId: account.id,
            rawMessage: message.toObject(),
          });
        }
      });

      client.on('contact', (contactList: Contact[]) => {
        for (const contact of contactList) {
          this.syncContactQueue.add('syncContact', {
            accountId: account.id,
            contact: contact.toObject(),
          });
        }
      });

      await client.api.login(LoginPolicy.DEFAULT, {
        onLoginStart: (loginType: LoginType) => {
          this.loginStartQueue.add('loginStart', {
            accountId: account.id,
            loginType,
          });
        },
        onOneClickEvent: (oneClickEvent: QRCodeEvent) => {
          this.loginQrCodeQueue.add('loginQrcode', {
            accountId: account.id,
            qrCodeEvent: oneClickEvent.toObject(),
          });
        },
        onQrCodeEvent: (qrCodeEvent: QRCodeEvent) => {
          this.loginQrCodeQueue.add('loginQrcode', {
            accountId: account.id,
            qrCodeEvent: qrCodeEvent.toObject(),
          });
        },
        onLoginSuccess: (contact: Contact) => {
          this.loginSuccessQueue.add('loginSuccess', {
            accountId: account.id,
            contactSelf: contact.toObject(),
          });
        },
        onSync: (syncEvent: SyncEvent) => {
          for (const contact of syncEvent.getContactList()) {
            this.syncContactQueue.add('syncContact', {
              accountId: account.id,
              contact: contact.toObject(),
            });
          }

          for (const message of syncEvent.getMessageList()) {
            this.newRawMessageQueue.add('newRawMessage', {
              accountId: account.id,
              rawMessage: message.toObject(),
            });
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
          this.syncContactQueue.add('syncContact', {
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

    return this.db.query.wechatFriendshipRequest.findMany({
      columns: {
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
      where: eq(wechatFriendshipRequest.sourceUsername, username),
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
      await this.db.query.wechatFriendshipRequest.findFirst({
        where: eq(wechatFriendshipRequest.id, friendshipRequestId),
        orderBy: (requests, { desc }) => [desc(requests.createdAt)],
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
    await this.db
      .delete(wechatFriendshipRequest)
      .where(
        and(
          eq(
            wechatFriendshipRequest.sourceUsername,
            friendshipRequest.sourceUsername,
          ),
          eq(wechatFriendshipRequest.username, friendshipRequest.username),
        ),
      );
  }

  public updateContactRemark(
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

  public async addChatRoomMember(
    accountId: number,
    roomId: string,
    username: string,
  ): Promise<AddChatRoomMemberType> {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.addChatRoomMember(roomId, username);
  }

  public async getMessageImage(
    accountId: number,
    messageContent: string,
    messageToUserName: string,
    imageType: ImageType,
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.getMessageImage(
      messageContent,
      messageToUserName,
      imageType,
    );
  }

  public getMessageVoice(
    accountId: number,
    messageId: string,
    messageContent: string,
    messageToUserName: string,
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.getMessageVoice(
      messageId,
      messageContent,
      messageToUserName,
    );
  }

  public async getMessageAttach(
    accountId: number,
    messageContent: string,
    messageToUserName: string,
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    return client.api.getMessageAttach(messageContent, messageToUserName);
  }

  public async sendMessageVoice(
    accountId: number,
    messageToUserName: string,
    voiceS3Path: string,
    voiceLength: number,
  ) {
    const client = this.clients.get(accountId);

    if (!client) {
      throw new Error(`Account ${accountId} not found`);
    }

    const resStream = await this.minio.getObject(
      this.configService.get('padlocal.assetsBucketName'),
      voiceS3Path,
    );
    const buffers = [];
    for await (const data of resStream) {
      buffers.push(data);
    }
    const data = Buffer.concat(buffers);
    return client.api.sendVoiceMessage(
      uuid().replace(/-/g, ''),
      messageToUserName,
      data,
      voiceLength,
    );
  }

  public getLoggedInWechatUsername(accountId: number): Promise<string> {
    return this.redisService.client.get(`loggedInUser:${accountId}`);
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.debug(
      `Shutting down all running padlocal clients after receiving ${signal}`,
    );
    const clients = this.clients.values();
    for (const client of clients) {
      await client.shutdown();
    }
  }
}
