import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { fromUnixTime } from 'date-fns';
import { XMLParser } from 'fast-xml-parser';
import { Message } from 'padlocal-client-ts/dist/proto/padlocal_pb';

import {
  PadlocalAppMessageContent,
  PadlocalChatHistoryMessageContent,
  PadlocalMessage,
  PadlocalMessageContent,
  PadlocalMessageContentType,
  PadlocalMessageType,
  PadlocalReferMessageContent,
  PadlocalTextMessageContent,
  PadlocalUnknownMessageContent,
} from './models';
import { isIMRoomId, isRoomId } from './utils';

@Injectable()
export class MessageParserService {
  private readonly logger = new Logger(MessageParserService.name);
  private readonly parser = new XMLParser();

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
    const { type, content, binarypayload } = message;

    let payload = content;
    if (content.indexOf(':\n') > -1) {
      // const from = content.slice(0, content.indexOf(':\n'));
      payload = content.slice(content.indexOf(':\n') + 2);
    }

    switch (type) {
      case PadlocalMessageType.Text:
        return plainToInstance(PadlocalTextMessageContent, {
          type: PadlocalMessageContentType.TEXT,
          text: payload,
        });
      case PadlocalMessageType.App:
        return this.parseAppMessageContent(payload);
      default:
        return plainToInstance(PadlocalUnknownMessageContent, {
          type: PadlocalMessageContentType.UNKNOWN,
          messageType: type,
          payload,
        });
    }
  }

  private parseAppMessageContent(payload: string): PadlocalMessageContent {
    // this.logger.debug(payload);
    const appXml = this.parser.parse(payload);

    const appMessageType = Number(appXml?.msg?.appmsg?.type);

    switch (appMessageType) {
      case PadlocalMessageType.ChatHistory: {
        const chatHistoryRecords = this.parser.parse(
          appXml?.msg?.appmsg?.recorditem,
        );
        return plainToInstance(PadlocalChatHistoryMessageContent, {
          type: PadlocalMessageContentType.CHAT_HISTORY,
          chatHistoryRecords,
        });
      }
      case PadlocalMessageType.Refer: {
        const referMessage = appXml?.msg?.appmsg?.refermsg || {};
        const {
          type: referMessageType,
          svrid: referredMessageId,
          chatusr,
          content,
        } = referMessage;
        switch (referMessageType) {
          case PadlocalMessageType.Text: {
            return plainToInstance(PadlocalReferMessageContent, {
              type: PadlocalMessageContentType.REFER,
              fromUsername: chatusr,
              text: appXml?.msg?.appmsg?.title,
              referredMessageId,
              referredContent: plainToInstance(PadlocalTextMessageContent, {
                type: PadlocalMessageContentType.TEXT,
                text: content,
              }),
            });
          }
          // TODO: other refer message types
          default: {
            return plainToInstance(PadlocalReferMessageContent, {
              type: PadlocalMessageContentType.REFER,
              fromUsername: chatusr,
              text: appXml?.msg?.appmsg?.title,
              referredMessageId,
              referredContent: plainToInstance(PadlocalUnknownMessageContent, {
                type: PadlocalMessageContentType.UNKNOWN,
                messageType: referMessageType,
                payload: content,
              }),
            });
          }
        }
      }
      default: {
        return plainToInstance(PadlocalAppMessageContent, {
          type: PadlocalMessageContentType.APP,
          appXml,
        });
      }
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
