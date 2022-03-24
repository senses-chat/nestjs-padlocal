import { Type } from 'class-transformer';

export enum PadlocalMessageType {
  TEXT = 1,
}

export enum PadlocalMessageContentType {
  TEXT = 'TEXT',
  UNKNOWN = 'UNKNOWN',
}

export abstract class PadlocalMessageContent {
  type: PadlocalMessageContentType;
}

export class PadlocalUnknownMessageContent extends PadlocalMessageContent {
  messageType: PadlocalMessageType;
  payload: string;
}

export class PadlocalTextMessageContent extends PadlocalMessageContent {
  text: string;
}

export class PadlocalMessage {
  id: string;
  createTime: Date;
  chatroom?: string;
  fromUsername: string;
  toUsername: string;

  @Type(() => PadlocalMessageContent, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: PadlocalTextMessageContent,
          name: PadlocalMessageContentType.TEXT,
        },
      ],
    },
  })
  content: PadlocalMessageContent;
}
