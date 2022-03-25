import { ICommand } from '@nestjs/cqrs';

import { PadlocalMessage } from '../models';

export class PadlocalNewMessageCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly message: PadlocalMessage,
  ) {}
}
