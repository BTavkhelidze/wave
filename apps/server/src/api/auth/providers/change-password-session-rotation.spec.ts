import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import type { UsersService } from 'src/api/users/providers/users.service';
import jwtConfig from 'src/config/jwt.config';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from 'src/common/http/auth-cookie-options';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { ChangePasswordProvider } from './change-password.provider';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { RefreshTokenProvider } from './refresh-tokens.provider';

type UserState = {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  hashedRefreshToken: string | null;
  sessionVersion: number;
};

type PrismaMock = {
  user: {
    findUnique: jest.Mock<Promise<UserState | null>, [unknown]>;
    update: jest.Mock<
      Promise<Pick<UserState, 'email' | 'id' | 'sessionVersion'>>,
      [unknown]
    >;
    updateMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
  };
  adminLog: {
    create: jest.Mock<Promise<unknown>, [unknown]>;
  };
  $transaction: jest.Mock<
    Promise<unknown>,
    [callback: (tx: Omit<PrismaMock, '$transaction'>) => unknown]
  >;
};

type MockResponse = Pick<Response, 'clearCookie' | 'cookie'> & {
  clearCookie: jest.Mock<Response, [string, unknown?]>;
  cookie: jest.Mock<Response, [string, string, unknown?]>;
};

const jwtConfiguration = {
  secret: 'test-secret',
  audience: 'wave-admin',
  issuer: 'wave-api',
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
} satisfies ConfigType<typeof jwtConfig>;

function createHashProvider() {
  return {
    hashPassword: jest.fn((data: string | Buffer) =>
      Promise.resolve(`hash:${data.toString()}`),
    ),
    comparePassword: jest.fn((data: string | Buffer, encrypted: string) =>
      Promise.resolve(encrypted === `hash:${data.toString()}`),
    ),
  };
}

function createConfigService(): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'appConfig.environment') {
        return 'development';
      }

      throw new Error(`Unexpected config key ${key}`);
    }),
  } as unknown as ConfigService;
}

function createResponse(): MockResponse {
  const response = {
    clearCookie: jest.fn(),
    cookie: jest.fn(),
  } as MockResponse;

  response.clearCookie.mockReturnValue(response as Response);
  response.cookie.mockReturnValue(response as Response);

  return response;
}

function cookieValue(response: MockResponse, name: string): string {
  const call = response.cookie.mock.calls.find(
    ([cookieName]) => cookieName === name,
  );

  if (!call) {
    throw new Error(`Missing cookie ${name}`);
  }

  return call[1];
}

function createAccessContext(accessToken: string): ExecutionContext {
  const request = {
    cookies: {},
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

function createPrismaService(userState: UserState): PrismaMock {
  const tx = {
    user: {
      findUnique: jest.fn<Promise<UserState | null>, [unknown]>(() =>
        Promise.resolve(userState),
      ),
      update: jest.fn<
        Promise<Pick<UserState, 'email' | 'id' | 'sessionVersion'>>,
        [unknown]
      >((args: unknown) => {
        const data = (
          args as {
            data?: {
              hashedRefreshToken?: null;
              password?: string;
              sessionVersion?: { increment?: number };
            };
          }
        ).data;

        if (data?.password) {
          userState.password = data.password;
        }

        if (data?.hashedRefreshToken === null) {
          userState.hashedRefreshToken = null;
        }

        userState.sessionVersion += data?.sessionVersion?.increment ?? 0;

        return Promise.resolve({
          id: userState.id,
          email: userState.email,
          sessionVersion: userState.sessionVersion,
        });
      }),
      updateMany: jest.fn<Promise<{ count: number }>, [unknown]>(
        (args: unknown) => {
          const updateArgs = args as {
            data?: { hashedRefreshToken?: string };
            where?: { id?: string; sessionVersion?: number };
          };

          if (
            updateArgs.where?.id !== userState.id ||
            updateArgs.where.sessionVersion !== userState.sessionVersion
          ) {
            return Promise.resolve({ count: 0 });
          }

          userState.hashedRefreshToken =
            updateArgs.data?.hashedRefreshToken ?? null;

          return Promise.resolve({ count: 1 });
        },
      ),
    },
    adminLog: {
      create: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
        id: 'log-id',
      }),
    },
  };

  return {
    ...tx,
    $transaction: jest
      .fn<Promise<unknown>, [callback: (transaction: typeof tx) => unknown]>()
      .mockImplementation((callback) => Promise.resolve(callback(tx))),
  };
}

describe('normal password change session rotation', () => {
  it('rejects the old token pair and accepts the newly issued cookie pair', async () => {
    const userState: UserState = {
      id: 'user-id',
      email: 'admin@example.com',
      password: 'hash:Current-password1!',
      isActive: true,
      hashedRefreshToken: null,
      sessionVersion: 1,
    };
    const jwtService = new JwtService();
    const generateTokenProvider = new GenerateTokenProvider(
      jwtService,
      jwtConfiguration,
    );
    const hashProvider = createHashProvider();
    const prismaService = createPrismaService(userState);
    const configService = createConfigService();
    const oldTokens = await generateTokenProvider.generateTokens(userState);

    userState.hashedRefreshToken = await hashProvider.hashPassword(
      oldTokens.refreshToken,
    );

    const activeUserGuard = new ActiveUserGuard(
      prismaService as unknown as PrismaService,
    );
    const accessTokenGuard = new AccessTokenGuard(
      jwtService,
      activeUserGuard,
      jwtConfiguration,
    );
    const usersService = {
      findUserById: jest.fn(() => Promise.resolve(userState)),
      updateUserRefreshToken: jest.fn(
        (userId: string, hashedRefreshToken: string) => {
          if (userId === userState.id) {
            userState.hashedRefreshToken = hashedRefreshToken;
          }

          return Promise.resolve(userState);
        },
      ),
    };
    const refreshTokenProvider = new RefreshTokenProvider(
      jwtService,
      jwtConfiguration,
      usersService as unknown as UsersService,
      generateTokenProvider,
      hashProvider,
      configService,
    );
    const changePasswordProvider = new ChangePasswordProvider(
      prismaService as unknown as PrismaService,
      hashProvider,
      generateTokenProvider,
      configService,
    );
    const changePasswordResponse = createResponse();

    await expect(
      accessTokenGuard.canActivate(createAccessContext(oldTokens.accessToken)),
    ).resolves.toBe(true);

    await expect(
      changePasswordProvider.changePassword(
        userState.id,
        {
          currentPassword: 'Current-password1!',
          newPassword: 'N3w-password!',
        },
        changePasswordResponse as Response,
      ),
    ).resolves.toEqual({
      message: 'Password changed successfully',
    });

    const newAccessToken = cookieValue(
      changePasswordResponse,
      ACCESS_TOKEN_COOKIE_NAME,
    );
    const newRefreshToken = cookieValue(
      changePasswordResponse,
      REFRESH_TOKEN_COOKIE_NAME,
    );
    const newAccessPayload = await jwtService.verifyAsync<
      Record<string, unknown>
    >(newAccessToken, jwtConfiguration);
    const newRefreshPayload = await jwtService.verifyAsync<
      Record<string, unknown>
    >(newRefreshToken, jwtConfiguration);

    expect(newAccessPayload.sessionVersion).toBe(2);
    expect(newRefreshPayload.sessionVersion).toBe(2);
    await expect(
      accessTokenGuard.canActivate(createAccessContext(oldTokens.accessToken)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      refreshTokenProvider.refreshToken(
        oldTokens.refreshToken,
        createResponse(),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      accessTokenGuard.canActivate(createAccessContext(newAccessToken)),
    ).resolves.toBe(true);

    const refreshResponse = createResponse();

    await expect(
      refreshTokenProvider.refreshToken(newRefreshToken, refreshResponse),
    ).resolves.toEqual({
      status: 200,
      message: 'Tokens refreshed successfully',
    });
    expect(refreshResponse.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      }),
    );
  });
});
