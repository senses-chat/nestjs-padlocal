import { ICommand } from '@nestjs/cqrs';
import { Message } from 'padlocal-client-ts/dist/proto/padlocal_pb';

export class PadlocalNewRawMessageCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly rawMessage: Message.AsObject,
  ) {}
}
