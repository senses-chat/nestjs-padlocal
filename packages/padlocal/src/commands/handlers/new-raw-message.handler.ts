import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PadlocalNewRawMessageCommand } from '../new-raw-message.command';
import { MessageParserService } from '../../parser.service';
import { PadlocalNewMessageCommand } from '../new-message.command';

@CommandHandler(PadlocalNewRawMessageCommand)
export class PadlocalNewRawMessageCommandHandler
  implements ICommandHandler<PadlocalNewRawMessageCommand, void>
{
  private logger = new Logger(PadlocalNewRawMessageCommandHandler.name);

  constructor(
    private readonly parser: MessageParserService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: PadlocalNewRawMessageCommand): Promise<void> {
    this.commandBus.execute(
      new PadlocalNewMessageCommand(
        command.accountId,
        this.parser.parseMessage(command.rawMessage),
      ),
    );
    this.logger.debug(`new raw message command: ${JSON.stringify(command)}`);
  }
}
