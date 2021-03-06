import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PadlocalModule } from '@senses-chat/padlocal-module';

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
    PadlocalModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
