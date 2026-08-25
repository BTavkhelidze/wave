import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { buildJwtConfiguration } from './jwt.config';

const ORIGINAL_ENV = process.env;
const VALID_JWT_VALUE = 'prod-jwt-value-32-characters-minimum-ok';
const WRONG_JWT_VALUE = 'different-jwt-value-32-characters-min-ok';

function setJwtEnv(overrides: Record<string, string | undefined> = {}): void {
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'production',
    JWT_SECRET: VALID_JWT_VALUE,
    JWT_AUDIENCE: 'wave-admin',
    JWT_ISSUER: 'wave-api',
    JWT_ACCESS_TOKEN_EXPIRES_IN: '15m',
    JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
  };

  for (const [name, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[name];
      continue;
    }

    process.env[name] = value;
  }
}

describe('jwt configuration', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('rejects a missing production JWT secret before startup', () => {
    setJwtEnv({ JWT_SECRET: undefined });

    expect(() => buildJwtConfiguration()).toThrow('JWT_SECRET is required');
  });

  it('rejects a short production JWT secret without printing it', () => {
    setJwtEnv({ JWT_SECRET: 'short' });

    expect(() => buildJwtConfiguration()).toThrow(
      'JWT_SECRET must be at least 32 characters in production',
    );
  });

  it('rejects a known placeholder production JWT secret', () => {
    setJwtEnv({ JWT_SECRET: 'replace-me-with-a-real-value-please' });

    expect(() => buildJwtConfiguration()).toThrow(
      'JWT_SECRET must not use a placeholder value in production',
    );
  });

  it('accepts a valid production JWT configuration', () => {
    setJwtEnv();

    expect(buildJwtConfiguration()).toEqual({
      secret: VALID_JWT_VALUE,
      audience: 'wave-admin',
      issuer: 'wave-api',
      accessTokenExpiresIn: '15m',
      refreshTokenExpiresIn: '7d',
    });
  });

  it('signs and verifies access and refresh tokens with the validated config', async () => {
    setJwtEnv();
    const configuration = buildJwtConfiguration();
    const jwtService = new JwtService();
    const payload = {
      sub: 'user-id',
      email: 'admin@example.com',
      sessionVersion: 4,
    };

    const [accessToken, refreshToken] = await Promise.all([
      jwtService.signAsync(payload, {
        secret: configuration.secret,
        audience: configuration.audience,
        issuer: configuration.issuer,
        expiresIn: configuration.accessTokenExpiresIn as StringValue,
      }),
      jwtService.signAsync(payload, {
        secret: configuration.secret,
        audience: configuration.audience,
        issuer: configuration.issuer,
        expiresIn: configuration.refreshTokenExpiresIn as StringValue,
      }),
    ]);

    await expect(
      jwtService.verifyAsync(accessToken, {
        secret: configuration.secret,
        audience: configuration.audience,
        issuer: configuration.issuer,
      }),
    ).resolves.toMatchObject(payload);
    await expect(
      jwtService.verifyAsync(refreshToken, {
        secret: configuration.secret,
        audience: configuration.audience,
        issuer: configuration.issuer,
      }),
    ).resolves.toMatchObject(payload);
    await expect(
      jwtService.verifyAsync(accessToken, {
        secret: WRONG_JWT_VALUE,
        audience: configuration.audience,
        issuer: configuration.issuer,
      }),
    ).rejects.toThrow();
  });

  it('does not keep the old fallback secret in AuthModule source', () => {
    const authModuleSource = readFileSync(
      join(__dirname, '../api/auth/auth.module.ts'),
      'utf8',
    );

    expect(authModuleSource).not.toContain('supersecret');
  });
});
