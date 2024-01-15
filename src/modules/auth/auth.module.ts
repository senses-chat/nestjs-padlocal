import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import authConfig from './auth.config';
import { AuthService } from './auth.service';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('auth.jwt'),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthMiddleware],
  exports: [AuthService, AuthMiddleware, JwtModule],
})
export class AuthModule {}
