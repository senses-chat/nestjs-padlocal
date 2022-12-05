import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PadlocalFriendshipRequestMessageContent, PadlocalMessageContentType } from '../../models';
import { PadlocalNewFriendRequestCommand } from '../new-friend-request.command';
import { PadlocalNewMessageCommand } from '../new-message.command';

@CommandHandler(PadlocalNewMessageCommand)
export class PadlocalNewMessageCommandHandler
  implements ICommandHandler<PadlocalNewMessageCommand, void>
{
  private logger = new Logger(PadlocalNewMessageCommandHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: PadlocalNewMessageCommand): Promise<void> {
    if (command.message.content.type === PadlocalMessageContentType.FRIENDSHIP_REQUEST) {
      this.commandBus.execute(
        new PadlocalNewFriendRequestCommand(
          command.accountId,
          command.message.content as PadlocalFriendshipRequestMessageContent,
        ),
      );
    }

    this.logger.log(`new message command: ${JSON.stringify(command)}`);
  }
}
