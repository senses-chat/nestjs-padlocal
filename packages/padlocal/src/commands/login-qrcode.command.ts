import { ICommand } from '@nestjs/cqrs';
import { QRCodeEvent } from 'padlocal-client-ts/dist/proto/padlocal_pb';

export class PadlocalLoginQRCodeCommand implements ICommand {
  constructor(
    public readonly accountId: number,
    public readonly qrCodeEvent: QRCodeEvent.AsObject,
  ) {}
}
