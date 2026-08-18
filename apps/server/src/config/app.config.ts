import { registerAs } from '@nestjs/config';

const DEFAULT_API_PREFIX = 'api';
const DEFAULT_HTTP_PORT = 5000;
const DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES = 30;
const DEFAULT_MAIL_PORT = 587;
const DEFAULT_ADMIN_APP_URL = 'http://localhost:5173';
const DEFAULT_PUBLIC_WEBSITE_URL = 'https://waveengineering.ge';

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

function parseMailPort(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const port = Number(value.trim());

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('MAIL_PORT must be an integer between 1 and 65535');
  }

  return port;
}

function getOptionalString(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

function getValidatedUrl(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`${name} is required`);
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function assertProductionMailConfiguration(
  environment: string,
  mail: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    to?: string;
  },
): void {
  if (environment !== 'production') {
    return;
  }

  const missingVariables = [
    ['MAIL_HOST', mail.host],
    ['MAIL_PORT', mail.port],
    ['MAIL_USER', mail.user],
    ['MAIL_PASSWORD', mail.password],
    ['MAIL_TO', mail.to],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(
      `Production mail configuration is incomplete: ${missingVariables.join(', ')} required`,
    );
  }
}

export default registerAs('appConfig', () => {
  const environment = process.env.NODE_ENV?.trim() || 'development';
  const port = parseHttpPort(process.env.HTTP_PORT);
  const apiPrefix = process.env.HTTP_API_PREFIX?.trim() || DEFAULT_API_PREFIX;
  const publicWebsiteUrl = getValidatedUrl(
    'PUBLIC_WEBSITE_URL',
    DEFAULT_PUBLIC_WEBSITE_URL,
  );
  const passwordResetExpiresInMinutes = parsePositiveInteger(
    process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES,
    DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES,
    'PASSWORD_RESET_EXPIRES_IN_MINUTES',
  );
  const mailHost = getOptionalString('MAIL_HOST', 'SMTP_HOST');
  const mailPort =
    parseMailPort(getOptionalString('MAIL_PORT', 'SMTP_PORT')) ??
    (mailHost ? DEFAULT_MAIL_PORT : undefined);
  const mailUser = getOptionalString('MAIL_USER', 'SMTP_USER');
  const mailPassword = getOptionalString('MAIL_PASSWORD', 'SMTP_PASSWORD');
  const mailTo = getOptionalString('MAIL_TO');
  const contactNotificationEmail = getOptionalString(
    'CONTACT_NOTIFICATION_EMAIL',
  );
  const mailFrom =
    getOptionalString('MAIL_FROM') ??
    (mailUser ? `Wave Engineering <${mailUser}>` : undefined);

  assertProductionMailConfiguration(environment, {
    host: mailHost,
    port: mailPort,
    user: mailUser,
    password: mailPassword,
    to: mailTo,
  });

  return {
    environment,
    publicWebsiteUrl,
    emailLogoUrl: getValidatedUrl(
      'EMAIL_LOGO_URL',
      new URL('/logo-16k.svg', publicWebsiteUrl).toString(),
    ),
    frontendUrl: process.env.FRONTEND_URL?.trim() || 'http://localhost:5173',
    adminAppUrl: getValidatedUrl('ADMIN_APP_URL', DEFAULT_ADMIN_APP_URL),
    mail: {
      from: mailFrom,
      to: mailTo,
      contactNotificationEmail,
      provider:
        getOptionalString('MAIL_PROVIDER') ?? (mailHost ? 'smtp' : undefined),
      smtp: {
        host: mailHost,
        port: mailPort,
        user: mailUser,
        password: mailPassword,
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
