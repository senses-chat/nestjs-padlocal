import { ICommand } from '@nestjs/cqrs';
import { Message } from 'padlocal-client-ts/dist/proto/padlocal_pb';

export class PadlocalNewMessageCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly message: Message.AsObject,
  ) {}
}
