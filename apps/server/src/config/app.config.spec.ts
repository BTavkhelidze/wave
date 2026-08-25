import { buildAppConfiguration } from './app.config';

const ORIGINAL_ENV = process.env;

function setAppEnv(overrides: Record<string, string | undefined> = {}): void {
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'production',
    HTTP_PORT: '5000',
    HTTP_API_PREFIX: 'api',
    HTTP_HOST: 'https://api.waveengineering.ge/api',
    FRONTEND_URL: 'https://admin.waveengineering.ge',
    ADMIN_APP_URL: 'https://admin.waveengineering.ge',
    PUBLIC_WEBSITE_URL: 'https://waveengineering.ge',
    TRUSTED_BROWSER_ORIGINS:
      'https://admin.waveengineering.ge,https://waveengineering.ge',
    HETZNER_S3_ENDPOINT: 'https://objectstorage.example.com',
    HETZNER_S3_REGION: 'eu-central',
    HETZNER_S3_BUCKET: 'wave-bucket',
    HETZNER_S3_ACCESS_KEY: 's3-public-credential-value',
    HETZNER_S3_SECRET_KEY: 's3-private-credential-value',
    MAIL_HOST: 'smtp.example.com',
    MAIL_PORT: '465',
    MAIL_SECURE: 'true',
    MAIL_USER: 'sender@example.com',
    MAIL_PASSWORD: 'mail-private-credential-value',
    MAIL_FROM: 'Wave Engineering <sender@example.com>',
    MAIL_TO: 'admin@example.com',
  };

  for (const [name, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[name];
      continue;
    }

    process.env[name] = value;
  }
}

describe('app configuration hardening', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('disables API documentation in production by default', () => {
    setAppEnv();

    expect(buildAppConfiguration().docs.enabled).toBe(false);
  });

  it('rejects contradictory production API documentation configuration', () => {
    setAppEnv({ API_DOCS_ENABLED: 'true' });

    expect(() => buildAppConfiguration()).toThrow(
      'API_DOCS_ENABLED must not be true in production',
    );
  });

  it('parses false API documentation flags explicitly', () => {
    setAppEnv({
      NODE_ENV: 'development',
      API_DOCS_ENABLED: 'false',
      HTTP_HOST: 'http://localhost:5000/api',
      FRONTEND_URL: 'http://localhost:5173',
      ADMIN_APP_URL: 'http://localhost:5173',
      PUBLIC_WEBSITE_URL: 'http://localhost:5173',
      TRUSTED_BROWSER_ORIGINS: 'http://localhost:5173',
    });

    expect(buildAppConfiguration().docs.enabled).toBe(false);
  });

  it('enables API documentation by default only in development', () => {
    setAppEnv({
      NODE_ENV: 'development',
      HTTP_HOST: 'http://localhost:5000/api',
      FRONTEND_URL: 'http://localhost:5173',
      ADMIN_APP_URL: 'http://localhost:5173',
      PUBLIC_WEBSITE_URL: 'http://localhost:5173',
      TRUSTED_BROWSER_ORIGINS: 'http://localhost:5173',
    });

    expect(buildAppConfiguration().docs.enabled).toBe(true);
  });

  it('requires explicit application origins in production', () => {
    setAppEnv({ ADMIN_APP_URL: undefined });

    expect(() => buildAppConfiguration()).toThrow(
      'ADMIN_APP_URL is required in production',
    );
  });

  it.each([
    ['ADMIN_APP_URL', 'http://localhost:5173'],
    ['PUBLIC_WEBSITE_URL', 'http://127.0.0.1:3000'],
    ['FRONTEND_URL', 'http://[::1]:5173'],
    ['HTTP_HOST', 'http://localhost:5000/api'],
  ])('rejects local production URL values for %s', (name, value) => {
    setAppEnv({ [name]: value });

    expect(() => buildAppConfiguration()).toThrow(name);
  });

  it.each([
    ['ADMIN_APP_URL', 'http://admin.waveengineering.ge'],
    ['PUBLIC_WEBSITE_URL', 'http://waveengineering.ge'],
    ['FRONTEND_URL', 'http://admin.waveengineering.ge'],
    ['HTTP_HOST', 'http://api.waveengineering.ge/api'],
  ])('rejects non-HTTPS production URL values for %s', (name, value) => {
    setAppEnv({ [name]: value });

    expect(() => buildAppConfiguration()).toThrow(name);
  });

  it('rejects production application origins with query strings', () => {
    setAppEnv({ ADMIN_APP_URL: 'https://admin.waveengineering.ge?x=1' });

    expect(() => buildAppConfiguration()).toThrow('ADMIN_APP_URL');
  });

  it('rejects production HTTP_HOST values with query strings', () => {
    setAppEnv({ HTTP_HOST: 'https://api.waveengineering.ge/api?x=1' });

    expect(() => buildAppConfiguration()).toThrow('HTTP_HOST');
  });

  it('rejects placeholder production service secrets', () => {
    setAppEnv({ HETZNER_S3_SECRET_KEY: 'secret-key' });

    expect(() => buildAppConfiguration()).toThrow(
      'HETZNER_S3_SECRET_KEY must not use a placeholder value in production',
    );
  });

  it('accepts explicitly configured local origins in development', () => {
    setAppEnv({
      NODE_ENV: 'development',
      HTTP_HOST: 'http://localhost:5000/api',
      FRONTEND_URL: 'http://localhost:3000',
      ADMIN_APP_URL: 'http://localhost:5173',
      PUBLIC_WEBSITE_URL: 'http://localhost:5173',
      TRUSTED_BROWSER_ORIGINS: 'http://localhost:3000,http://localhost:5173',
      MAIL_PASSWORD: 'use-an-app-password',
      HETZNER_S3_SECRET_KEY: 'secret-key',
    });

    expect(buildAppConfiguration().security.trustedBrowserOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });
});
