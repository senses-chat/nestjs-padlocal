import { KickoutProcessor } from './kickout.processor';
import { LoginSuccessProcessor } from './login-success.processor';
import { NewRawMessageProcessor } from './new-raw-message.processor';
import { NewMessageProcessor } from './new-message.processor';
import { NewFriendRequestProcessor } from './new-friend-request.processor';
import { LoginQrcodeProcessor } from './login-qrcode.processor';
import { LoginStartProcessor } from './login-start.processor';
import { SyncContactProcessor } from './sync-contact.processor';
import { ActionsProcessor } from './actions.processor';
import { FriendRequestProcessor } from './friend-request.processor';
import { ImageMessageProcessor } from './image-message.processor';
import { VoiceMessageProcessor } from './voice-message.processor';
import { FileMessageProcessor } from './file-message.processor';

export const processors = [
  KickoutProcessor,
  LoginSuccessProcessor,
  NewRawMessageProcessor,
  NewMessageProcessor,
  ImageMessageProcessor,
  VoiceMessageProcessor,
  FileMessageProcessor,
  NewFriendRequestProcessor,
  LoginQrcodeProcessor,
  LoginStartProcessor,
  SyncContactProcessor,
  ActionsProcessor,
  FriendRequestProcessor,
];
