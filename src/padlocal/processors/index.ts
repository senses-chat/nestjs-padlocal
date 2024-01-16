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

export const processors = [
  KickoutProcessor,
  LoginSuccessProcessor,
  NewRawMessageProcessor,
  NewMessageProcessor,
  NewFriendRequestProcessor,
  LoginQrcodeProcessor,
  LoginStartProcessor,
  SyncContactProcessor,
  ActionsProcessor,
  FriendRequestProcessor,
];
