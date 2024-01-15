import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('auth', (): { jwt: JwtModuleOptions } => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'aTestSecretThatNeedsToBeChanged',
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
  },
}));
