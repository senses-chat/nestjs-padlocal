import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);

  const configService: ConfigService = app.get(ConfigService);

  const port = configService.get('app.port');
  await app.listen(port, '0.0.0.0');
  logger.log(`server started listening at 0.0.0.0:${port}`);
}
bootstrap();
