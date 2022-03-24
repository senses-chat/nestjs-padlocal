import { PadlocalKickoutCommandHandler } from './kickout.handler';
import { PadlocalLoginQRCodeCommandHandler } from './login-qrcode.handler';
import { PadlocalLoginStartCommandHandler } from './login-start.handler';
import { PadlocalLoginSuccessCommandHandler } from './login-success.handler';

export const commandHandlers = [
  PadlocalKickoutCommandHandler,
  PadlocalLoginQRCodeCommandHandler,
  PadlocalLoginStartCommandHandler,
  PadlocalLoginSuccessCommandHandler,
];
