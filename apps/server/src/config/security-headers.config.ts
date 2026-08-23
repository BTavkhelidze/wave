import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import type { Express } from 'express';

const HSTS_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export function applySecurityHeaders(
  app: INestApplication,
  configService: ConfigService,
): void {
  const environment = configService.getOrThrow<string>('appConfig.environment');
  const isProduction = environment === 'production';
  const expressApp = app.getHttpAdapter().getInstance() as Express;

  expressApp.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'none'"],
              baseUri: ["'none'"],
              connectSrc: ["'none'"],
              fontSrc: ["'none'"],
              formAction: ["'none'"],
              frameAncestors: ["'none'"],
              imgSrc: ["'none'"],
              scriptSrc: ["'none'"],
              styleSrc: ["'none'"],
            },
          }
        : false,
      hsts: isProduction
        ? {
            maxAge: HSTS_MAX_AGE_SECONDS,
            includeSubDomains: true,
            preload: false,
          }
        : false,
    }),
  );
}
