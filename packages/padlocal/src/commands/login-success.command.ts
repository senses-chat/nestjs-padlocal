import { ICommand } from '@nestjs/cqrs';
import { Contact } from 'padlocal-client-ts/dist/proto/padlocal_pb';

export class PadlocalLoginSuccessCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly contactSelf: Contact.AsObject,
  ) {}
}
