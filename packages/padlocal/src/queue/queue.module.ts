import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule } from '@senses-chat/padlocal-db';
import { PadlocalModule } from '../padlocal.module';
import { processor } from './processor';
import { QueueService } from './queue.service';
import { QUEUES } from '../config/config';
@Module({
  imports: [
    StorageModule.register(),
    forwardRef(() => PadlocalModule),
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: configService.get('redis'),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(...QUEUES.queuesArray),
  ],
  providers: [QueueService, ...processor],
  exports: [QueueService],
})
export class QueueModule {}
