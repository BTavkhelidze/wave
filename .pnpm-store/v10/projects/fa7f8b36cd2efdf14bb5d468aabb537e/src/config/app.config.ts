import { registerAs } from '@nestjs/config';

const DEFAULT_API_PREFIX = 'api';
const DEFAULT_HTTP_PORT = 5000;
const DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES = 30;

function getRequiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function parseHttpPort(value: string | undefined): number {
  const port = Number(value?.trim() || DEFAULT_HTTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('HTTP_PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const parsed = Number(value?.trim() || fallback);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export default registerAs('appConfig', () => {
  const port = parseHttpPort(process.env.HTTP_PORT);
  const apiPrefix = process.env.HTTP_API_PREFIX?.trim() || DEFAULT_API_PREFIX;
  const passwordResetExpiresInMinutes = parsePositiveInteger(
    process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES,
    DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES,
    'PASSWORD_RESET_EXPIRES_IN_MINUTES',
  );

  return {
    environment: process.env.NODE_ENV?.trim() || 'development',
    frontendUrl: process.env.FRONTEND_URL?.trim() || 'http://localhost:5173',
    mail: {
      from: process.env.MAIL_FROM?.trim(),
      provider: process.env.MAIL_PROVIDER?.trim(),
      smtp: {
        host: process.env.SMTP_HOST?.trim(),
        port: process.env.SMTP_PORT?.trim(),
        user: process.env.SMTP_USER?.trim(),
        password: process.env.SMTP_PASSWORD?.trim(),
      },
    },
    hetznerS3: {
      endpoint: getRequiredString('HETZNER_S3_ENDPOINT'),
      region: getRequiredString('HETZNER_S3_REGION'),
      bucket: getRequiredString('HETZNER_S3_BUCKET'),
      accessKey: getRequiredString('HETZNER_S3_ACCESS_KEY'),
      secretKey: getRequiredString('HETZNER_S3_SECRET_KEY'),
    },
    passwordReset: {
      expiresInMinutes: passwordResetExpiresInMinutes,
      rateLimit: {
        windowMs: parsePositiveInteger(
          process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
          15 * 60 * 1000,
          'PASSWORD_RESET_RATE_LIMIT_WINDOW_MS',
        ),
        maxRequests: parsePositiveInteger(
          process.env.PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS,
          5,
          'PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS',
        ),
      },
    },
    apiPrefix,
    http: {
      port,
      host:
        process.env.HTTP_HOST?.trim() ||
        `http://localhost:${port}/${apiPrefix}`,
    },
  };
});
