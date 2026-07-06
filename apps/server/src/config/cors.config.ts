import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

export function getCorsConfig(configService: ConfigService): CorsOptions {
  const configuredOrigins = configService.get<string>('HTTP_CORS');
  const origins = configuredOrigins
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin: origins?.length ? origins : DEFAULT_CORS_ORIGINS,
    credentials: true,
  };
}
