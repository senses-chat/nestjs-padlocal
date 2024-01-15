import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import queuesConfig from './queues.config';
import { getBullBoardModuleWithAuth } from './bull-board-auth.module';

@Module({
  imports: [
    ConfigModule.forFeature(queuesConfig),
    getBullBoardModuleWithAuth(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('queues.bullmq'),
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
