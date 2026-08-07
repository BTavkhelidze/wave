import { registerAs } from '@nestjs/config';

function getRequiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export default registerAs('jwtConfig', () => ({
  secret: getRequiredString('JWT_SECRET'),
  audience: getRequiredString('JWT_AUDIENCE'),
  issuer: getRequiredString('JWT_ISSUER'),
  accessTokenExpiresIn: getRequiredString('JWT_ACCESS_TOKEN_EXPIRES_IN'),
  refreshTokenExpiresIn: getRequiredString('JWT_REFRESH_TOKEN_EXPIRES_IN'),
}));
