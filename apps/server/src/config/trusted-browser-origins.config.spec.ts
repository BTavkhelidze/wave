import {
  normalizeRequestOrigin,
  parseTrustedBrowserOrigins,
} from './trusted-browser-origins.config';

describe('trusted browser origin parsing', () => {
  it('normalizes and deduplicates exact configured origins', () => {
    expect(
      parseTrustedBrowserOrigins({
        environment: 'production',
        configuredOrigins:
          'https://admin.waveengineering.ge, https://admin.waveengineering.ge/',
        fallbackOrigins: [],
      }),
    ).toEqual(['https://admin.waveengineering.ge']);
  });

  it('keeps application fallback origins when extra trusted origins are configured', () => {
    expect(
      parseTrustedBrowserOrigins({
        environment: 'development',
        configuredOrigins: 'https://preview.waveengineering.ge',
        fallbackOrigins: ['http://localhost:5173', 'http://localhost:3000'],
      }),
    ).toEqual([
      'https://preview.waveengineering.ge',
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  it('rejects invalid production trusted origins during startup', () => {
    expect(() =>
      parseTrustedBrowserOrigins({
        environment: 'production',
        configuredOrigins: 'http://admin.waveengineering.ge',
        fallbackOrigins: [],
      }),
    ).toThrow('Trusted browser origins must use HTTPS in production');

    expect(() =>
      parseTrustedBrowserOrigins({
        environment: 'production',
        configuredOrigins: 'https://admin.waveengineering.ge/path',
        fallbackOrigins: [],
      }),
    ).toThrow('Origin must not include a path, query string, or fragment');

    expect(() =>
      parseTrustedBrowserOrigins({
        environment: 'production',
        configuredOrigins: '*',
        fallbackOrigins: [],
      }),
    ).toThrow(
      'Trusted browser origins must not contain null or wildcard values',
    );
  });

  it('rejects malformed request origins', () => {
    expect(() => normalizeRequestOrigin('null')).toThrow(
      'Invalid request origin',
    );
    expect(() =>
      normalizeRequestOrigin(
        'https://admin.waveengineering.ge, https://attacker.example',
      ),
    ).toThrow('Invalid request origin');
    expect(() => normalizeRequestOrigin('not-a-url')).toThrow(
      'Origin must be an absolute HTTP or HTTPS URL',
    );
  });
});
