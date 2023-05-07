import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QueueModule } from 'src/queue';
import { PadlocalModule } from 'src/padlocal';

import serverConfig from './config';
import { AppController } from './app.controller';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      // mimic behaviors from nextjs
      envFilePath: [`.env.${ENV}.local`, `.env.${ENV}`, `.env.local`, '.env'],
      load: [serverConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          ...configService.get('redis'),
          enableOfflineQueue: false,
        },
      }),
      inject: [ConfigService],
    }),
    QueueModule,
    PadlocalModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
