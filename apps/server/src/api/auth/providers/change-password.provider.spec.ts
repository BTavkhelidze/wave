import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ChangePasswordProvider } from './change-password.provider';
import { GenerateTokenProvider } from './generate-tokens.provider';

describe('ChangePasswordProvider', () => {
  const now = new Date('2026-08-08T10:00:00.000Z');
  const userRecord = {
    id: 'user-id',
    email: 'admin@example.com',
    password: 'hashed-current-password',
  };

  type PrismaTxMock = {
    user: {
      findUnique: jest.Mock<Promise<unknown>, [unknown]>;
      update: jest.Mock<Promise<unknown>, [unknown]>;
      updateMany: jest.Mock<Promise<{ count: number }>, [unknown]>;
    };
    adminLog: {
      create: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };

  type PrismaServiceMock = PrismaTxMock & {
    $transaction: jest.Mock<
      Promise<unknown>,
      [callback: (tx: PrismaTxMock) => unknown]
    >;
  };

  let prismaService: PrismaServiceMock;
  let hashProvider: {
    hashPassword: jest.Mock<Promise<string>, [string]>;
    comparePassword: jest.Mock<Promise<boolean>, [string, string]>;
  };
  let generateTokenProvider: {
    generateTokens: jest.Mock<
      Promise<{ accessToken: string; refreshToken: string }>,
      [{ id: string; email: string; sessionVersion: number }]
    >;
  };
  let configService: {
    getOrThrow: jest.Mock<string, [string]>;
  };
  let response: Pick<Response, 'clearCookie' | 'cookie'>;
  let provider: ChangePasswordProvider;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaService = {
      user: {
        findUnique: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue(userRecord),
        update: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: userRecord.id,
          email: userRecord.email,
          sessionVersion: 1,
        }),
        updateMany: jest
          .fn<Promise<{ count: number }>, [unknown]>()
          .mockResolvedValue({ count: 1 }),
      },
      adminLog: {
        create: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: 'log-id' }),
      },
      $transaction: jest
        .fn<Promise<unknown>, [callback: (tx: PrismaTxMock) => unknown]>()
        .mockImplementation((callback) =>
          Promise.resolve(
            callback({
              user: prismaService.user,
              adminLog: prismaService.adminLog,
            }),
          ),
        ),
    };
    hashProvider = {
      hashPassword: jest
        .fn<Promise<string>, [string]>()
        .mockResolvedValueOnce('hashed-new-password')
        .mockResolvedValue('hashed-refresh-token'),
      comparePassword: jest
        .fn<Promise<boolean>, [string, string]>()
        .mockResolvedValue(false),
    };
    generateTokenProvider = {
      generateTokens: jest
        .fn<
          Promise<{ accessToken: string; refreshToken: string }>,
          [{ id: string; email: string; sessionVersion: number }]
        >()
        .mockResolvedValue({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
    };
    configService = {
      getOrThrow: jest.fn<string, [string]>().mockReturnValue('development'),
    };
    response = {
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };
    provider = new ChangePasswordProvider(
      prismaService as unknown as PrismaService,
      hashProvider,
      generateTokenProvider as unknown as GenerateTokenProvider,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('verifies the correct current password before updating the password', async () => {
    hashProvider.comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(
      provider.changePassword(
        userRecord.id,
        {
          currentPassword: 'Current-password1!',
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).resolves.toEqual({
      message: 'Password changed successfully',
    });

    expect(hashProvider.comparePassword).toHaveBeenNthCalledWith(
      1,
      'Current-password1!',
      userRecord.password,
    );
    expect(hashProvider.hashPassword).toHaveBeenCalledWith('N3w-password!');
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
      },
      data: {
        password: 'hashed-new-password',
        mustChangePassword: false,
        passwordChangedAt: now,
        hashedRefreshToken: null,
        sessionVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        email: true,
        sessionVersion: true,
      },
    });
    expect(prismaService.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: userRecord.id,
        action: AdminAction.PASSWORD_CHANGE,
        entity: AdminEntity.USER,
        entityId: userRecord.id,
      },
    });
    expect(generateTokenProvider.generateTokens).toHaveBeenCalledWith({
      id: userRecord.id,
      email: userRecord.email,
      sessionVersion: 1,
    });
    expect(prismaService.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
        sessionVersion: 1,
      },
      data: {
        hashedRefreshToken: 'hashed-refresh-token',
      },
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      }),
    );
    expect(response.clearCookie).not.toHaveBeenCalled();
  });

  it('rejects an incorrect current password without updating the password', async () => {
    hashProvider.comparePassword.mockResolvedValueOnce(false);

    await expect(
      provider.changePassword(
        userRecord.id,
        {
          currentPassword: 'Wrong-password1!',
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
    expect(prismaService.user.update).not.toHaveBeenCalled();
    expect(prismaService.user.updateMany).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).not.toHaveBeenCalled();
  });

  it('rejects matching current and new passwords without updating password or session state', async () => {
    hashProvider.comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(
      provider.changePassword(
        userRecord.id,
        {
          currentPassword: 'Current-password1!',
          newPassword: 'Current-password1!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
    expect(prismaService.user.update).not.toHaveBeenCalled();
    expect(prismaService.user.updateMany).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).not.toHaveBeenCalled();
  });

  it('does not overwrite a newer session when refresh-token persistence detects a concurrent version change', async () => {
    hashProvider.comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    prismaService.user.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      provider.changePassword(
        userRecord.id,
        {
          currentPassword: 'Current-password1!',
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    expect(prismaService.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
        sessionVersion: 1,
      },
      data: {
        hashedRefreshToken: 'hashed-refresh-token',
      },
    });
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      }),
    );
  });

  it('does not restore the old session when replacement refresh-token persistence fails', async () => {
    hashProvider.comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    prismaService.user.updateMany.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(
      provider.changePassword(
        userRecord.id,
        {
          currentPassword: 'Current-password1!',
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    expect(prismaService.user.updateMany).toHaveBeenCalledTimes(1);
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('supports the mandatory initial password change flow when mustChangePassword is set', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...userRecord,
      mustChangePassword: true,
    });
    hashProvider.comparePassword.mockResolvedValueOnce(false);

    await expect(
      provider.changeInitialPassword(
        userRecord.id,
        {
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).resolves.toEqual({
      message: 'Password changed successfully',
    });

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
      },
      select: {
        id: true,
        password: true,
        mustChangePassword: true,
      },
    });
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
      },
      data: {
        password: 'hashed-new-password',
        mustChangePassword: false,
        passwordChangedAt: now,
        hashedRefreshToken: null,
        sessionVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        email: true,
        sessionVersion: true,
      },
    });
  });

  it('issues replacement cookies with the incremented session version after initial password change', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...userRecord,
      mustChangePassword: true,
    });
    hashProvider.comparePassword.mockResolvedValueOnce(false);

    await provider.changeInitialPassword(
      userRecord.id,
      {
        newPassword: 'N3w-password!',
      },
      response as Response,
    );

    expect(generateTokenProvider.generateTokens).toHaveBeenCalledWith({
      id: userRecord.id,
      email: userRecord.email,
      sessionVersion: 1,
    });
    expect(prismaService.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: userRecord.id,
        sessionVersion: 1,
      },
      data: {
        hashedRefreshToken: 'hashed-refresh-token',
      },
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      }),
    );
  });

  it('rejects initial password change when mustChangePassword is not set', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...userRecord,
      mustChangePassword: false,
    });

    await expect(
      provider.changeInitialPassword(
        userRecord.id,
        {
          newPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});
