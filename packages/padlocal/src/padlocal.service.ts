import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PadLocalClient } from 'padlocal-client-ts';
import {
  Contact,
  LoginPolicy,
  LoginType,
  Message,
  QRCodeEvent,
  QRCodeStatus,
  SyncEvent,
} from 'padlocal-client-ts/dist/proto/padlocal_pb';

@Injectable()
export class PadlocalService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const logger = new Logger(PadlocalService.name);

    const client = await PadLocalClient.create(
      this.configService.get<string>('padlocal.token'),
    );

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
        logger.debug('start login with type: ', loginType);
      },
      onOneClickEvent: (oneClickEvent: QRCodeEvent) => {
        logger.debug(
          'on one click event: ',
          JSON.stringify(oneClickEvent.toObject()),
        );
      },
      onQrCodeEvent: (qrCodeEvent: QRCodeEvent) => {
        if (qrCodeEvent.getStatus() === QRCodeStatus.NEW) {
          logger.debug('\n▼▼▼ Please scan following qr code to login ▼▼▼\n');

          logger.verbose(qrCodeEvent.getImageurl());
        } else {
          logger.debug(
            'on qr code event: ',
            JSON.stringify(qrCodeEvent.toObject()),
          );
        }
      },
      onLoginSuccess(contact: Contact) {
        logger.debug('on login success: ', JSON.stringify(contact.toObject()));
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
