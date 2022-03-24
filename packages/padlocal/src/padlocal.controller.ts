import { Controller, Get, Param } from '@nestjs/common';

import { PadlocalService } from './padlocal.service';

@Controller('padlocal')
export class PadlocalController {
  constructor(private readonly padlocalService: PadlocalService) {}

  @Get('/:accountId/contacts/sync')
  async syncContacts(@Param('accountId') accountId: string): Promise<string> {
    await this.padlocalService.syncContacts(Number(accountId));
    return 'OK';
  }
}
