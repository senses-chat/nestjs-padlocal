// import { DynamicModule } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

// import { AuthMiddleware, AuthModule } from '~/modules/auth';

export function getBullBoardModuleWithAuth() {
  const bullBoardModule = BullBoardModule.forRoot({
    route: '/ctrls',
    adapter: ExpressAdapter,
    // middleware: AuthMiddleware,
  });

  // const rootModule = bullBoardModule.imports[0] as DynamicModule;

  // rootModule.imports.push(AuthModule);

  return bullBoardModule;
}
