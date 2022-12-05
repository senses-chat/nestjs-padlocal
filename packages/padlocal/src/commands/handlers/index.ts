import { PadlocalKickoutCommandHandler } from './kickout.handler';
import { PadlocalLoginQRCodeCommandHandler } from './login-qrcode.handler';
import { PadlocalLoginStartCommandHandler } from './login-start.handler';
import { PadlocalLoginSuccessCommandHandler } from './login-success.handler';
import { PadlocalNewFriendRequestCommandHandler } from './new-friend-request.handler';
import { PadlocalNewMessageCommandHandler } from './new-message.handler';
import { PadlocalNewRawMessageCommandHandler } from './new-raw-message.handler';
import { PadlocalSyncContactCommandHandler } from './sync-contact.handler';

export const commandHandlers = [
  PadlocalKickoutCommandHandler,
  PadlocalLoginQRCodeCommandHandler,
  PadlocalLoginStartCommandHandler,
  PadlocalLoginSuccessCommandHandler,
  PadlocalNewFriendRequestCommandHandler,
  PadlocalNewMessageCommandHandler,
  PadlocalNewRawMessageCommandHandler,
  PadlocalSyncContactCommandHandler,
];
