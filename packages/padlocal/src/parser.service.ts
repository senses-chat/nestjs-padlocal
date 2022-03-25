import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { fromUnixTime } from 'date-fns';
import { Message } from 'padlocal-client-ts/dist/proto/padlocal_pb';

import {
  PadlocalMessage,
  PadlocalMessageContent,
  PadlocalMessageContentType,
  PadlocalMessageType,
  PadlocalTextMessageContent,
  PadlocalUnknownMessageContent,
} from './models';
import { isIMRoomId, isRoomId } from './utils';

@Injectable()
export class MessageParserService {
  public parseMessage(message: Message.AsObject): PadlocalMessage {
    const messagePayload = this.parseMessageMetadata(message);
    const content = this.parseMessageContent(message);

    return plainToInstance(PadlocalMessage, {
      ...messagePayload,
      content,
    });
  }

  private parseMessageContent(
    message: Message.AsObject,
  ): PadlocalMessageContent {
    const { type, content } = message;

    let payload = content;
    if (content.indexOf(':\n') > -1) {
      // const from = content.slice(0, content.indexOf(':\n'));
      payload = content.slice(content.indexOf(':\n') + 2);
    }

    switch (type) {
      case PadlocalMessageType.TEXT:
        return plainToInstance(PadlocalTextMessageContent, {
          type: PadlocalMessageContentType.TEXT,
          text: payload,
        });
      default:
        return plainToInstance(PadlocalUnknownMessageContent, {
          type: PadlocalMessageContentType.UNKNOWN,
          messageType: type,
          payload,
        });
    }
  }

  private parseMessageMetadata(
    message: Message.AsObject,
  ): Omit<PadlocalMessage, 'content'> {
    const { fromusername, tousername, content, atList } = message;

    const chatroom =
      isRoomId(fromusername) || isIMRoomId(fromusername)
        ? fromusername
        : undefined;

    const fromUsername =
      chatroom && content.indexOf(':\n') > -1
        ? content.split(':\n')[0]
        : fromusername;

    return {
      id: message.id,
      createTime: fromUnixTime(message.createtime),
      chatroom: chatroom,
      fromUsername: fromUsername,
      toUsername: tousername,
      atList,
    };
  }
}
