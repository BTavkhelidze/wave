import { BadRequestException } from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import type { Response } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ResetPasswordProvider } from './reset-password.provider';
import { HashProvider } from './hash.provider';
import { PasswordResetTokenProvider } from './password-reset-token.provider';

describe('ResetPasswordProvider', () => {
  const now = new Date('2026-07-30T19:15:00.000Z');
  const tokenRecord = {
    id: 'token-id',
    userId: 'user-id',
    expiresAt: new Date('2026-07-30T19:30:00.000Z'),
    usedAt: null,
    user: {
      isActive: true,
    },
  };

  let prismaService: {
    passwordResetToken: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    user: {
      update: jest.Mock;
    };
    adminLog: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let hashProvider: {
    hashPassword: jest.Mock<Promise<string>, [string]>;
  };
  let tokenProvider: {
    hashToken: jest.Mock<string, [string]>;
  };
  let response: Pick<Response, 'clearCookie'>;
  let provider: ResetPasswordProvider;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaService = {
      passwordResetToken: {
        findUnique: jest.fn().mockResolvedValue(tokenRecord),
        updateMany: jest
          .fn()
          .mockResolvedValueOnce({ count: 1 })
          .mockResolvedValueOnce({ count: 2 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({ id: 'user-id' }),
      },
      adminLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-id' }),
      },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          passwordResetToken: prismaService.passwordResetToken,
          user: prismaService.user,
          adminLog: prismaService.adminLog,
        }),
      ),
    };
    hashProvider = {
      hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
    };
    tokenProvider = {
      hashToken: jest.fn().mockReturnValue('hashed-reset-token'),
    };
    response = {
      clearCookie: jest.fn(),
    };
    provider = new ResetPasswordProvider(
      prismaService as unknown as PrismaService,
      hashProvider as unknown as HashProvider,
      tokenProvider as unknown as PasswordResetTokenProvider,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resets the password, revokes sessions, invalidates tokens, logs the action, and clears cookies', async () => {
    await expect(
      provider.resetPassword(
        {
          token: 'raw-reset-token',
          newPassword: 'N3w-password!',
          confirmPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).resolves.toEqual({
      message:
        'Password has been reset successfully. Please sign in with your new password.',
    });

    expect(tokenProvider.hashToken).toHaveBeenCalledWith('raw-reset-token');
    expect(prismaService.passwordResetToken.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: 'hashed-reset-token',
      },
      select: expect.any(Object),
    });
    expect(prismaService.passwordResetToken.updateMany).toHaveBeenNthCalledWith(
      1,
      {
        where: {
          id: tokenRecord.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      },
    );
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: tokenRecord.userId,
      },
      data: {
        password: 'hashed-new-password',
        passwordChangedAt: now,
        mustChangePassword: false,
        hashedRefreshToken: null,
      },
    });
    expect(prismaService.passwordResetToken.updateMany).toHaveBeenNthCalledWith(
      2,
      {
        where: {
          userId: tokenRecord.userId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      },
    );
    expect(prismaService.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: tokenRecord.userId,
        action: AdminAction.PASSWORD_CHANGE,
        entity: AdminEntity.USER,
        entityId: tokenRecord.userId,
      },
    });
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', {
      path: '/',
    });
    expect(response.clearCookie).toHaveBeenCalledWith('accessToken', {
      path: '/',
    });
  });

  it('rejects an invalid token with a generic bad request', async () => {
    prismaService.passwordResetToken.findUnique.mockResolvedValueOnce(null);

    await expect(
      provider.resetPassword(
        {
          token: 'invalid',
          newPassword: 'N3w-password!',
          confirmPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    prismaService.passwordResetToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      expiresAt: new Date('2026-07-30T19:00:00.000Z'),
    });

    await expect(
      provider.resetPassword(
        {
          token: 'expired',
          newPassword: 'N3w-password!',
          confirmPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an already-used token', async () => {
    prismaService.passwordResetToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      usedAt: new Date('2026-07-30T19:10:00.000Z'),
    });

    await expect(
      provider.resetPassword(
        {
          token: 'used',
          newPassword: 'N3w-password!',
          confirmPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a token that loses the single-use claim race', async () => {
    prismaService.passwordResetToken.updateMany.mockReset();
    prismaService.passwordResetToken.updateMany.mockResolvedValueOnce({
      count: 0,
    });

    await expect(
      provider.resetPassword(
        {
          token: 'raced',
          newPassword: 'N3w-password!',
          confirmPassword: 'N3w-password!',
        },
        response as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
