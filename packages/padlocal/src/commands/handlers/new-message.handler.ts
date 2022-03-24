import {
  // Inject,
  Logger,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

// import {
//   KeyValueStorageBase,
//   PADLOCAL_KV_STORAGE,
// } from '@senses-chat/wechat-db';

import { PadlocalNewMessageCommand } from '../new-message.command';
import { MessageParserService } from '../../parser.service';

@CommandHandler(PadlocalNewMessageCommand)
export class PadlocalNewMessageCommandHandler
  implements ICommandHandler<PadlocalNewMessageCommand, void>
{
  private logger = new Logger(PadlocalNewMessageCommandHandler.name);

  constructor(
    // @Inject(PADLOCAL_KV_STORAGE)
    // private readonly kvStorage: KeyValueStorageBase,
    private readonly parser: MessageParserService,
  ) {}

  async execute(command: PadlocalNewMessageCommand): Promise<void> {
    this.logger.verbose(
      `new message command: ${JSON.stringify({
        ...command,
        message: this.parser.parseMessage(command.message),
      })}`,
    );
  }
}
