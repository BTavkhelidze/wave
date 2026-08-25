import { registerAs } from '@nestjs/config';

const MINIMUM_PRODUCTION_SECRET_LENGTH = 32;
const PLACEHOLDER_SECRET_PARTS = [
  'supersecret',
  'secret',
  'change-me',
  'changeme',
  'replace-me',
  'your-secret',
  'localhost',
] as const;

function getRequiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function assertProductionSecret(name: string, value: string): void {
  if (value.length < MINIMUM_PRODUCTION_SECRET_LENGTH) {
    throw new Error(
      `${name} must be at least ${MINIMUM_PRODUCTION_SECRET_LENGTH} characters in production`,
    );
  }

  const normalizedValue = value.toLowerCase();

  if (
    PLACEHOLDER_SECRET_PARTS.some((placeholder) =>
      normalizedValue.includes(placeholder),
    )
  ) {
    throw new Error(`${name} must not use a placeholder value in production`);
  }
}

function getRequiredJwtSecret(name: string): string {
  const value = getRequiredString(name);
  const environment = process.env.NODE_ENV?.trim() || 'development';

  if (environment === 'production') {
    assertProductionSecret(name, value);
  }

  return value;
}

export function buildJwtConfiguration() {
  return {
    secret: getRequiredJwtSecret('JWT_SECRET'),
    audience: getRequiredString('JWT_AUDIENCE'),
    issuer: getRequiredString('JWT_ISSUER'),
    accessTokenExpiresIn: getRequiredString('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    refreshTokenExpiresIn: getRequiredString('JWT_REFRESH_TOKEN_EXPIRES_IN'),
  };
}

export default registerAs('jwtConfig', buildJwtConfiguration);
