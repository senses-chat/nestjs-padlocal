import { registerAs } from '@nestjs/config';

export default registerAs('padlocal', () => ({
  token: process.env.PADLOCAL_TOKEN || '',
}));
