import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PadlocalNewMessageCommand } from '../new-message.command';

@CommandHandler(PadlocalNewMessageCommand)
export class PadlocalNewMessageCommandHandler
  implements ICommandHandler<PadlocalNewMessageCommand, void>
{
  private logger = new Logger(PadlocalNewMessageCommandHandler.name);

  async execute(command: PadlocalNewMessageCommand): Promise<void> {
    this.logger.verbose(`new message command: ${JSON.stringify(command)}`);
  }
}
