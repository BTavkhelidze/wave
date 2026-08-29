import { registerAs } from '@nestjs/config';
import { isIP } from 'node:net';
import { parseTrustedBrowserOrigins } from './trusted-browser-origins.config';

const DEFAULT_API_PREFIX = 'api';
const DEFAULT_HTTP_PORT = 5000;
const DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES = 30;
const DEFAULT_ADMIN_APP_URL = 'http://localhost:5173';
const DEFAULT_PUBLIC_WEBSITE_URL = 'http://localhost:5173';
const DEFAULT_AUTH_SIGNIN_BURST_LIMIT = 5;
const DEFAULT_AUTH_SIGNIN_BURST_WINDOW_SECONDS = 60;
const DEFAULT_AUTH_SIGNIN_SUSTAINED_LIMIT = 20;
const DEFAULT_AUTH_SIGNIN_SUSTAINED_WINDOW_SECONDS = 15 * 60;
const SUPPORTED_MAIL_PORTS = [465, 587] as const;
const PRODUCTION_SECRET_PLACEHOLDER_PARTS = [
  'supersecret',
  'secret',
  'change-me',
  'changeme',
  'replace-me',
  'your-secret',
  'password',
] as const;

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

function parseNonNegativeInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const parsed = Number(value?.trim() || fallback);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
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

  if (!SUPPORTED_MAIL_PORTS.some((supportedPort) => supportedPort === port)) {
    throw new Error(
      'MAIL_PORT must be 465 for implicit TLS or 587 for STARTTLS',
    );
  }

  return port;
}

function parseOptionalBoolean(
  value: string | undefined,
  name: string,
): boolean | undefined {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`${name} must be either true or false`);
}

function resolveMailSecure(
  port: number | undefined,
  configuredSecure: boolean | undefined,
): boolean | undefined {
  if (!port) {
    return configuredSecure;
  }

  const secure = configuredSecure ?? port === 465;

  if (port === 465 && !secure) {
    throw new Error('MAIL_SECURE must be true when MAIL_PORT is 465');
  }

  if (port === 587 && secure) {
    throw new Error('MAIL_SECURE must be false when MAIL_PORT is 587');
  }

  return secure;
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

function parseValidatedUrl(name: string, value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function getValidatedUrl(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return parseValidatedUrl(name, value).toString();
}

function isLocalApplicationHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

function getValidatedApplicationOrigin(
  name: string,
  environment: string,
  fallback?: string,
): string {
  const configuredValue = process.env[name]?.trim();

  if (environment === 'production' && !configuredValue) {
    throw new Error(`${name} is required in production`);
  }

  const value = configuredValue || fallback;

  if (!value) {
    throw new Error(`${name} is required`);
  }

  const url = parseValidatedUrl(name, value);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include credentials`);
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      `${name} must be an origin without a path, query string, or fragment`,
    );
  }

  if (environment === 'production') {
    if (url.protocol !== 'https:') {
      throw new Error(`${name} must use HTTPS in production`);
    }

    if (isLocalApplicationHostname(url.hostname)) {
      throw new Error(`${name} must not use localhost in production`);
    }
  }

  return url.origin;
}

function getValidatedHttpHost(
  environment: string,
  port: number,
  apiPrefix: string,
): string {
  const configuredValue = process.env.HTTP_HOST?.trim();

  if (environment === 'production' && !configuredValue) {
    throw new Error('HTTP_HOST is required in production');
  }

  const value = configuredValue || `http://localhost:${port}/${apiPrefix}`;
  const url = parseValidatedUrl('HTTP_HOST', value);

  if (url.username || url.password) {
    throw new Error('HTTP_HOST must not include credentials');
  }

  if (url.search || url.hash) {
    throw new Error('HTTP_HOST must not include a query string or fragment');
  }

  if (environment === 'production') {
    if (url.protocol !== 'https:') {
      throw new Error('HTTP_HOST must use HTTPS in production');
    }

    if (isLocalApplicationHostname(url.hostname)) {
      throw new Error('HTTP_HOST must not use localhost in production');
    }
  }

  return url.toString();
}

function getValidatedDatabaseUrl(environment: string): string {
  const value = getRequiredString('DATABASE_URL');
  const url = parseValidatedUrl('DATABASE_URL', value);

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error('DATABASE_URL must use the postgresql protocol');
  }

  if (environment === 'production') {
    if (isLocalApplicationHostname(url.hostname)) {
      throw new Error('DATABASE_URL must not use localhost in production');
    }

    assertProductionSecretValue(
      environment,
      'DATABASE_URL password',
      url.password,
    );
  }

  return value;
}

function getValidatedMailHost(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (isIP(value)) {
    throw new Error('MAIL_HOST must be a hostname, not an IP address');
  }

  if (!/^[A-Za-z0-9.-]+$/.test(value) || !value.includes('.')) {
    throw new Error('MAIL_HOST must be a valid hostname');
  }

  return value;
}

function isValidEmailAddress(value: string): boolean {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

function getValidatedMailFrom(
  configuredFrom: string | undefined,
  mailUser: string | undefined,
): string | undefined {
  const value =
    configuredFrom ??
    (mailUser && isValidEmailAddress(mailUser)
      ? `Wave Engineering <${mailUser}>`
      : undefined);

  if (!value) {
    return undefined;
  }

  if (/[\r\n]/.test(value)) {
    throw new Error('MAIL_FROM must not contain line breaks');
  }

  const mailboxMatch = value.match(/<([^<>]+)>$/);
  const address = mailboxMatch ? mailboxMatch[1]?.trim() : value.trim();

  if (!address || !isValidEmailAddress(address)) {
    throw new Error('MAIL_FROM must contain a valid email address');
  }

  return value;
}

function assertMailConfiguration(
  environment: string,
  mail: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    password?: string;
    from?: string;
    to?: string;
  },
): void {
  const hasSmtpConfigurationValue = Boolean(
    mail.host ||
    mail.port ||
    mail.secure !== undefined ||
    mail.user ||
    mail.password ||
    mail.from,
  );
  const missingSmtpVariables = [
    ['MAIL_HOST', mail.host],
    ['MAIL_PORT', mail.port],
    ['MAIL_SECURE', mail.secure],
    ['MAIL_USER', mail.user],
    ['MAIL_PASSWORD', mail.password],
    ['MAIL_FROM', mail.from],
  ]
    .filter(
      ([, value]) => value === undefined || value === null || value === '',
    )
    .map(([name]) => name);

  if (hasSmtpConfigurationValue && missingSmtpVariables.length > 0) {
    throw new Error(
      `SMTP mail configuration is incomplete: ${missingSmtpVariables.join(', ')} required`,
    );
  }

  if (environment !== 'production') {
    return;
  }

  const missingProductionVariables = [
    ...missingSmtpVariables,
    ...(!mail.to ? ['MAIL_TO'] : []),
  ];

  if (missingProductionVariables.length > 0) {
    throw new Error(
      `Production mail configuration is incomplete: ${missingProductionVariables.join(', ')} required`,
    );
  }
}

function assertProductionSecretValue(
  environment: string,
  name: string,
  value: string | undefined,
): void {
  if (environment !== 'production' || !value) {
    return;
  }

  const normalizedValue = value.toLowerCase();

  if (
    PRODUCTION_SECRET_PLACEHOLDER_PARTS.some((placeholder) =>
      normalizedValue.includes(placeholder),
    )
  ) {
    throw new Error(`${name} must not use a placeholder value in production`);
  }
}

function parseApiDocsEnabled(
  environment: string,
  value: string | undefined,
): boolean {
  const configuredValue = parseOptionalBoolean(value, 'API_DOCS_ENABLED');

  if (environment === 'production') {
    if (configuredValue === true) {
      throw new Error('API_DOCS_ENABLED must not be true in production');
    }

    return false;
  }

  if (environment === 'test') {
    return configuredValue ?? false;
  }

  return configuredValue ?? environment === 'development';
}

export function buildAppConfiguration() {
  const environment = process.env.NODE_ENV?.trim() || 'development';
  const port = parseHttpPort(process.env.HTTP_PORT);
  const apiPrefix = process.env.HTTP_API_PREFIX?.trim() || DEFAULT_API_PREFIX;
  const publicWebsiteUrl = getValidatedApplicationOrigin(
    'PUBLIC_WEBSITE_URL',
    environment,
    DEFAULT_PUBLIC_WEBSITE_URL,
  );
  const frontendUrl = getValidatedApplicationOrigin(
    'FRONTEND_URL',
    environment,
    DEFAULT_ADMIN_APP_URL,
  );
  const adminAppUrl = getValidatedApplicationOrigin(
    'ADMIN_APP_URL',
    environment,
    DEFAULT_ADMIN_APP_URL,
  );
  const trustedBrowserOrigins = parseTrustedBrowserOrigins({
    environment,
    configuredOrigins:
      getOptionalString('TRUSTED_BROWSER_ORIGINS') ??
      getOptionalString('HTTP_CORS'),
    fallbackOrigins: [adminAppUrl, publicWebsiteUrl, frontendUrl],
  });
  const passwordResetExpiresInMinutes = parsePositiveInteger(
    process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES,
    DEFAULT_PASSWORD_RESET_EXPIRES_MINUTES,
    'PASSWORD_RESET_EXPIRES_IN_MINUTES',
  );
  const mailHost = getValidatedMailHost(
    getOptionalString('MAIL_HOST', 'SMTP_HOST'),
  );
  const mailPort = parseMailPort(getOptionalString('MAIL_PORT', 'SMTP_PORT'));
  const mailSecure = resolveMailSecure(
    mailPort,
    parseOptionalBoolean(process.env.MAIL_SECURE, 'MAIL_SECURE'),
  );
  const mailUser = getOptionalString('MAIL_USER', 'SMTP_USER');
  const mailPassword = getOptionalString('MAIL_PASSWORD', 'SMTP_PASSWORD');
  const mailTo = getOptionalString('MAIL_TO');
  const contactNotificationEmail = getOptionalString(
    'CONTACT_NOTIFICATION_EMAIL',
  );
  const mailFrom = getValidatedMailFrom(
    getOptionalString('MAIL_FROM'),
    mailUser,
  );
  const databaseUrl = getValidatedDatabaseUrl(environment);

  assertMailConfiguration(environment, {
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    user: mailUser,
    password: mailPassword,
    from: mailFrom,
    to: mailTo,
  });
  assertProductionSecretValue(environment, 'MAIL_PASSWORD', mailPassword);
  const hetznerS3AccessKey = getRequiredString('HETZNER_S3_ACCESS_KEY');
  const hetznerS3SecretKey = getRequiredString('HETZNER_S3_SECRET_KEY');

  assertProductionSecretValue(
    environment,
    'HETZNER_S3_ACCESS_KEY',
    hetznerS3AccessKey,
  );
  assertProductionSecretValue(
    environment,
    'HETZNER_S3_SECRET_KEY',
    hetznerS3SecretKey,
  );

  return {
    environment,
    publicWebsiteUrl,
    emailLogoUrl: getValidatedUrl(
      'EMAIL_LOGO_URL',
      new URL('/logo-16k.svg', publicWebsiteUrl).toString(),
    ),
    frontendUrl,
    adminAppUrl,
    security: {
      trustedBrowserOrigins,
    },
    mail: {
      from: mailFrom,
      to: mailTo,
      contactNotificationEmail,
      provider:
        getOptionalString('MAIL_PROVIDER') ?? (mailHost ? 'smtp' : undefined),
      smtp: {
        host: mailHost,
        port: mailPort,
        secure: mailSecure,
        user: mailUser,
        password: mailPassword,
      },
    },
    hetznerS3: {
      endpoint: getRequiredString('HETZNER_S3_ENDPOINT'),
      region: getRequiredString('HETZNER_S3_REGION'),
      bucket: getRequiredString('HETZNER_S3_BUCKET'),
      accessKey: hetznerS3AccessKey,
      secretKey: hetznerS3SecretKey,
    },
    database: {
      url: databaseUrl,
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
    auth: {
      signInRateLimit: {
        burst: {
          limit: parsePositiveInteger(
            process.env.AUTH_SIGNIN_BURST_LIMIT,
            DEFAULT_AUTH_SIGNIN_BURST_LIMIT,
            'AUTH_SIGNIN_BURST_LIMIT',
          ),
          windowSeconds: parsePositiveInteger(
            process.env.AUTH_SIGNIN_BURST_WINDOW_SECONDS,
            DEFAULT_AUTH_SIGNIN_BURST_WINDOW_SECONDS,
            'AUTH_SIGNIN_BURST_WINDOW_SECONDS',
          ),
        },
        sustained: {
          limit: parsePositiveInteger(
            process.env.AUTH_SIGNIN_SUSTAINED_LIMIT,
            DEFAULT_AUTH_SIGNIN_SUSTAINED_LIMIT,
            'AUTH_SIGNIN_SUSTAINED_LIMIT',
          ),
          windowSeconds: parsePositiveInteger(
            process.env.AUTH_SIGNIN_SUSTAINED_WINDOW_SECONDS,
            DEFAULT_AUTH_SIGNIN_SUSTAINED_WINDOW_SECONDS,
            'AUTH_SIGNIN_SUSTAINED_WINDOW_SECONDS',
          ),
        },
      },
    },
    apiPrefix,
    docs: {
      enabled: parseApiDocsEnabled(environment, process.env.API_DOCS_ENABLED),
    },
    http: {
      port,
      trustProxyHops: parseNonNegativeInteger(
        process.env.HTTP_TRUST_PROXY_HOPS,
        0,
        'HTTP_TRUST_PROXY_HOPS',
      ),
      host: getValidatedHttpHost(environment, port, apiPrefix),
    },
  };
}

export default registerAs('appConfig', buildAppConfiguration);
