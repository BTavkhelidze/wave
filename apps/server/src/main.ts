import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';

import { getCorsConfig } from './config/cors.config';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import { setupApiDocumentation } from './config/api-docs.config';
import { applySecurityHeaders } from './config/security-headers.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = new Logger(AppModule.name);
  const apiPrefix = configService.getOrThrow<string>('appConfig.apiPrefix');
  const trustProxyHops = configService.getOrThrow<number>(
    'appConfig.http.trustProxyHops',
  );

  if (trustProxyHops > 0) {
    const expressApp = app.getHttpAdapter().getInstance() as Express;
    expressApp.set('trust proxy', trustProxyHops);
  }

  applySecurityHeaders(app, configService);
  app.setGlobalPrefix(apiPrefix);

  app.enableCors(getCorsConfig(configService));
  app.use(cookieParser());

  setupApiDocumentation(app, configService);
  const port = configService.getOrThrow<number>('appConfig.http.port');
  const host = configService.getOrThrow<string>('appConfig.http.host');

  try {
    await app.listen(port, '0.0.0.0');

    Logger.log(`Server is running at: ${host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start server: ${error.message}`, error);
    } else {
      logger.error('Failed to start server: unknown error', error as string);
    }
    process.exit(1);
  }
}
void bootstrap();
