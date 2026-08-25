import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService, ConfigType } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import type { UsersService } from 'src/api/users/providers/users.service';
import jwtConfig from 'src/config/jwt.config';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { RefreshTokenProvider } from './refresh-tokens.provider';

describe('RefreshTokenProvider session version validation', () => {
  const user = {
    id: 'user-id',
    email: 'admin@example.com',
    isActive: true,
    hashedRefreshToken: 'stored-refresh-token-hash',
    sessionVersion: 2,
  };

  let jwtService: {
    verifyAsync: jest.Mock<Promise<Record<string, unknown>>, [string, unknown]>;
  };
  let userService: {
    findUserById: jest.Mock<Promise<typeof user>, [string]>;
    updateUserRefreshToken: jest.Mock<Promise<unknown>, [string, string]>;
  };
  let generateTokenProvider: {
    generateTokens: jest.Mock<
      Promise<{ accessToken: string; refreshToken: string }>,
      [typeof user]
    >;
  };
  let hashProvider: {
    comparePassword: jest.Mock<Promise<boolean>, [string, string]>;
    hashPassword: jest.Mock<Promise<string>, [string]>;
  };
  let response: Pick<Response, 'cookie'>;
  let provider: RefreshTokenProvider;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest
        .fn<Promise<Record<string, unknown>>, [string, unknown]>()
        .mockResolvedValue({
          sub: user.id,
          sessionVersion: user.sessionVersion,
        }),
    };
    userService = {
      findUserById: jest
        .fn<Promise<typeof user>, [string]>()
        .mockResolvedValue(user),
      updateUserRefreshToken: jest
        .fn<Promise<unknown>, [string, string]>()
        .mockResolvedValue(user),
    };
    generateTokenProvider = {
      generateTokens: jest
        .fn<
          Promise<{ accessToken: string; refreshToken: string }>,
          [typeof user]
        >()
        .mockResolvedValue({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
    };
    hashProvider = {
      comparePassword: jest
        .fn<Promise<boolean>, [string, string]>()
        .mockResolvedValue(true),
      hashPassword: jest
        .fn<Promise<string>, [string]>()
        .mockResolvedValue('new-refresh-token-hash'),
    };
    response = {
      cookie: jest.fn(),
    };
    provider = new RefreshTokenProvider(
      jwtService as unknown as JwtService,
      {
        secret: 'secret',
        audience: 'wave-admin',
        issuer: 'wave-api',
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
      } satisfies ConfigType<typeof jwtConfig>,
      userService as unknown as UsersService,
      generateTokenProvider as unknown as GenerateTokenProvider,
      hashProvider,
      {
        getOrThrow: jest.fn<string, [string]>().mockReturnValue('development'),
      } as unknown as ConfigService,
    );
  });

  it('refreshes when the refresh token session version matches the user', async () => {
    await expect(
      provider.refreshToken('refresh-token', response as Response),
    ).resolves.toEqual({
      status: 200,
      message: 'Tokens refreshed successfully',
    });

    expect(hashProvider.comparePassword).toHaveBeenCalledWith(
      'refresh-token',
      user.hashedRefreshToken,
    );
    expect(generateTokenProvider.generateTokens).toHaveBeenCalledWith(user);
    expect(userService.updateUserRefreshToken).toHaveBeenCalledWith(
      user.id,
      'new-refresh-token-hash',
    );
  });

  it('rejects an old refresh token session version before issuing tokens', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce({
      sub: user.id,
      sessionVersion: 1,
    });

    await expect(
      provider.refreshToken('old-refresh-token', response as Response),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(hashProvider.comparePassword).not.toHaveBeenCalled();
    expect(generateTokenProvider.generateTokens).not.toHaveBeenCalled();
    expect(userService.updateUserRefreshToken).not.toHaveBeenCalled();
  });

  it('rejects pre-deployment refresh tokens without a session version claim', async () => {
    jwtService.verifyAsync.mockResolvedValueOnce({
      sub: user.id,
    });

    await expect(
      provider.refreshToken('legacy-refresh-token', response as Response),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(userService.findUserById).not.toHaveBeenCalled();
  });
});
