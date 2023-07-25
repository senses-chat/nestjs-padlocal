import { Type } from 'class-transformer';

export enum PadlocalMessageType {
  Text = 1,
  Image = 3,
  ChatHistory = 19,
  Voice = 34,
  VerifyMsg = 37,
  PossibleFriendMsg = 40,
  ShareCard = 42,
  Video = 43,
  Emoticon = 47,
  Location = 48,
  App = 49,
  VoipMsg = 50,
  StatusNotify = 51,
  VoipNotify = 52,
  VoipInvite = 53,
  Refer = 57,
  MicroVideo = 62,
  VerifyMsgEnterprise = 65,
  Transfer = 2000, // 转账
  RedEnvelope = 2001, // 红包
  MiniProgram = 2002, // 小程序
  GroupInvite = 2003, // 群邀请
  File = 2004, // 文件消息
  SysNotice = 9999,
  Sys = 10000,
  Recalled = 10002, // NOTIFY 服务通知
}

export enum PadlocalMessageContentType {
  UNKNOWN = 'UNKNOWN',
  TEXT = 'TEXT',
  APP = 'APP', // TODO: breakdown further
  REFER = 'REFER', // 引用回复
  CHAT_HISTORY = 'CHAT_HISTORY',
  FRIENDSHIP_REQUEST = 'FRIENDSHIP_REQUEST',
  IMAGE = 'IMAGE',
  VOICE = "VOICE"
}

export abstract class PadlocalMessageContent {
  type: PadlocalMessageContentType;
  messageType: PadlocalMessageType;
  binarypayload?: string;
}

export class PadlocalUnknownMessageContent extends PadlocalMessageContent {
  payload: string;
}

export class PadlocalTextMessageContent extends PadlocalMessageContent {
  text: string;
}

export class PadlocalImageMessageContent extends PadlocalMessageContent {
  content: string;
  binarypayload: string;
}

export class PadlocalAppMessageContent extends PadlocalMessageContent {
  appXml: any;
}

export class PadlocalChatHistoryMessageContent extends PadlocalMessageContent {
  chatHistoryRecords: any;
}

export class PadlocalReferMessageContent extends PadlocalTextMessageContent {
  fromUsername: string;
  text: string;
  referredMessageId: string;
  referredContent: PadlocalMessageContent;
}

export class PadlocalFriendshipRequestMessageContent extends PadlocalMessageContent {
  fromUsername: string;
  encryptUsername: string;
  nickname: string;
  ticket: string;
  requestMessage: string;
  scene: number;
  avatar?: string;
  gender?: number;
  alias?: string;
  city?: string;
  province?: string;
  country?: string;
  payload: any;
}

export class PadlocalMessage {
  id: string;
  createTime: Date;
  chatroom?: string;
  fromUsername: string;
  toUsername: string;
  atList: string[];

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
