import type { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies(
  res: Response<any, Record<string, any>>,
  tokens: AuthTokens,
  configService: ConfigService,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
    ...getAuthCookieBaseOptions(configService),
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });

  res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    ...getAuthCookieBaseOptions(configService),
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(
  res: Response<any, Record<string, any>>,
  configService: ConfigService,
): void {
  const clearOptions = getAuthCookieClearOptions(configService);

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearOptions);
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, clearOptions);
}

export function getAuthCookieBaseOptions(
  configService: ConfigService,
): CookieOptions {
  const isProduction =
    configService.getOrThrow<string>('appConfig.environment') === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };
}

export function getAuthCookieClearOptions(
  configService: ConfigService,
): CookieOptions {
  return getAuthCookieBaseOptions(configService);
}
