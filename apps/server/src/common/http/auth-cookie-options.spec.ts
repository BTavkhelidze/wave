import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  getAuthCookieBaseOptions,
  getAuthCookieClearOptions,
  setAuthCookies,
} from './auth-cookie-options';

function createConfigService(environment: string): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.environment') {
        return environment;
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
}

describe('auth cookie options', () => {
  it('uses HttpOnly Secure SameSite Strict host-only cookies in production', () => {
    const options = getAuthCookieBaseOptions(createConfigService('production'));

    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    expect(options).not.toHaveProperty('domain');
  });

  it('uses explicit local-development cookie settings outside production', () => {
    const options = getAuthCookieBaseOptions(
      createConfigService('development'),
    );

    expect(options).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    expect(options).not.toHaveProperty('domain');
  });

  it('sets and clears access and refresh cookies with matching identity options', () => {
    const configService = createConfigService('production');
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    setAuthCookies(
      response as unknown as Response,
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      configService,
    );
    clearAuthCookies(response as unknown as Response, configService);

    const clearOptions = getAuthCookieClearOptions(configService);

    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      'refresh-token',
      expect.objectContaining(clearOptions),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      'access-token',
      expect.objectContaining(clearOptions),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      clearOptions,
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      clearOptions,
    );
  });
});
