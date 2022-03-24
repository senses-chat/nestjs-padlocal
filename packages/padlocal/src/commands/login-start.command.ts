import { ICommand } from '@nestjs/cqrs';
import { LoginType } from 'padlocal-client-ts/dist/proto/padlocal_pb';

export class PadlocalLoginStartCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly loginType: LoginType,
  ) {}
}
