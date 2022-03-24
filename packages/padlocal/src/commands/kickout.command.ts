import { ICommand } from '@nestjs/cqrs';
import { KickOutEvent } from 'padlocal-client-ts';

export class PadlocalKickoutCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly kickoutEvent: KickOutEvent,
  ) {}
}
