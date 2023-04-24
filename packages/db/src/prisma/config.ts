import { registerAs } from '@nestjs/config';
import { Prisma } from '@prisma/client';

export default registerAs(
  'prisma',
  () =>
    ({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://padlocal:padlocalrocks@localhost:5432/wechat',
        },
      },
    } as Prisma.PrismaClientOptions),
);
