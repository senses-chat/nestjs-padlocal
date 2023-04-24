import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('kickout')
    private readonly kickoutQueue: Queue,
    @InjectQueue('loginQrcode')
    private readonly loginQrcodeQueue: Queue,
    @InjectQueue('loginStart')
    private readonly loginStartQueue: Queue,
    @InjectQueue('loginSuccess')
    private readonly loginSuccessQueue: Queue,
    @InjectQueue('newFriendRequest')
    private readonly newFriendRequestQueue: Queue,
    @InjectQueue('newMessage')
    private readonly newMessageQueue: Queue,
    @InjectQueue('newRawMessage')
    private readonly newRawMessageQueue: Queue,
    @InjectQueue('syncContact')
    private readonly syncContactQueue: Queue,
    @InjectQueue('common')
    private readonly commonQueue: Queue,
  ) {}

  async add(name: string, data: any, options?: JobsOptions) {
    await this[`${name}Queue`].add(`name:${data.accountId}`, data, options);
  }

  async commonAdd(name: string, data: any, options?: JobsOptions) {
    await this.commonQueue.add(name, data, options);
  }
}
