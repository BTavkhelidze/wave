import { buildAppConfiguration } from './app.config';
import {
  buildMailerOptions,
  buildSmtpTransportOptions,
} from './mail-transport.config';

const ORIGINAL_ENV = process.env;

function withEnvironment<T>(
  overrides: NodeJS.ProcessEnv,
  callback: () => T,
): T {
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'production',
    HTTP_PORT: '5000',
    HTTP_API_PREFIX: 'api',
    HTTP_HOST: 'https://api.waveengineering.ge/api',
    FRONTEND_URL: 'https://admin.waveengineering.ge',
    PUBLIC_WEBSITE_URL: 'https://waveengineering.ge',
    ADMIN_APP_URL: 'https://admin.waveengineering.ge',
    DATABASE_URL:
      'postgresql://wave_user:prod-db-credential-value@db.wave.internal:5432/wave',
    HETZNER_S3_ENDPOINT: 'https://example.objectstorage.com',
    HETZNER_S3_REGION: 'region',
    HETZNER_S3_BUCKET: 'bucket',
    HETZNER_S3_ACCESS_KEY: 's3-public-credential-value',
    HETZNER_S3_SECRET_KEY: 's3-private-credential-value',
    MAIL_PROVIDER: 'smtp',
    MAIL_HOST: 'smtp.example.test',
    MAIL_PORT: '465',
    MAIL_SECURE: 'true',
    MAIL_USER: 'mailbox@example.test',
    MAIL_PASSWORD: 'mail-private-credential-value',
    MAIL_FROM: 'Wave Engineering <mailbox@example.test>',
    MAIL_TO: 'admin@example.test',
    ...overrides,
  };

  try {
    return callback();
  } finally {
    process.env = ORIGINAL_ENV;
  }
}

describe('mail transport configuration', () => {
  it('builds implicit TLS transport for port 465', () => {
    const config = withEnvironment({}, buildAppConfiguration);
    const transport = buildSmtpTransportOptions(config.mail.smtp);

    expect(transport).toMatchObject({
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });
    expect(transport).not.toHaveProperty('requireTLS');
  });

  it('builds STARTTLS transport for port 587', () => {
    const config = withEnvironment(
      {
        MAIL_PORT: '587',
        MAIL_SECURE: 'false',
      },
      buildAppConfiguration,
    );
    const transport = buildSmtpTransportOptions(config.mail.smtp);

    expect(transport).toMatchObject({
      port: 587,
      secure: false,
      requireTLS: true,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });
  });

  it('rejects invalid mail ports', () => {
    expect(() =>
      withEnvironment(
        {
          MAIL_PORT: 'not-a-port',
        },
        buildAppConfiguration,
      ),
    ).toThrow('MAIL_PORT must be an integer between 1 and 65535');

    expect(() =>
      withEnvironment(
        {
          MAIL_PORT: '2525',
        },
        buildAppConfiguration,
      ),
    ).toThrow('MAIL_PORT must be 465 for implicit TLS or 587 for STARTTLS');
  });

  it('rejects contradictory port and TLS mode combinations', () => {
    expect(() =>
      withEnvironment(
        {
          MAIL_PORT: '465',
          MAIL_SECURE: 'false',
        },
        buildAppConfiguration,
      ),
    ).toThrow('MAIL_SECURE must be true when MAIL_PORT is 465');

    expect(() =>
      withEnvironment(
        {
          MAIL_PORT: '587',
          MAIL_SECURE: 'true',
        },
        buildAppConfiguration,
      ),
    ).toThrow('MAIL_SECURE must be false when MAIL_PORT is 587');
  });

  it('parses string boolean values without treating false as truthy', () => {
    const config = withEnvironment(
      {
        MAIL_PORT: '587',
        MAIL_SECURE: 'false',
      },
      buildAppConfiguration,
    );

    expect(config.mail.smtp.secure).toBe(false);
  });

  it('never creates a configured mailer option with disabled certificate validation', () => {
    const config = withEnvironment({}, buildAppConfiguration);
    const mailerOptions = buildMailerOptions({
      smtp: config.mail.smtp,
      from: config.mail.from,
    });

    expect(JSON.stringify(mailerOptions)).not.toContain(
      '"rejectUnauthorized":false',
    );
  });
});
