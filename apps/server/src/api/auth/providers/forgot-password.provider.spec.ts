import { InternalServerErrorException } from '@nestjs/common';
import {
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  ForgotPasswordProvider,
} from './forgot-password.provider';
import type { ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { PasswordResetTokenProvider } from './password-reset-token.provider';
import { PasswordResetEmailService } from '../email/password-reset-email.service';
import { PasswordResetRateLimitProvider } from './password-reset-rate-limit.provider';
import appConfig from 'src/config/app.config';

type PasswordResetUser = {
  id: string;
  email: string;
  isActive: boolean;
};

type PasswordResetTokenUpdateManyArgs = {
  where: {
    userId: string;
    usedAt: null;
  };
  data: {
    usedAt: Date;
  };
};

type PasswordResetTokenCreateArgs = {
  data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  };
};

type PasswordResetTokenTransaction = {
  passwordResetToken: {
    updateMany: jest.Mock<
      Promise<{ count: number }>,
      [PasswordResetTokenUpdateManyArgs]
    >;
    create: jest.Mock<Promise<{ id: string }>, [PasswordResetTokenCreateArgs]>;
  };
};

describe('ForgotPasswordProvider', () => {
  const appConfiguration = {
    frontendUrl: 'http://localhost:5173',
    passwordReset: {
      expiresInMinutes: 30,
      rateLimit: {
        windowMs: 900000,
        maxRequests: 5,
      },
    },
  };

  const user = {
    id: 'user-id',
    email: 'admin@example.com',
    isActive: true,
  };

  let prismaService: {
    user: {
      findFirst: jest.Mock<Promise<PasswordResetUser | null>, [unknown]>;
    };
    passwordResetToken: {
      updateMany: jest.Mock<
        Promise<{ count: number }>,
        [PasswordResetTokenUpdateManyArgs]
      >;
      create: jest.Mock<
        Promise<{ id: string }>,
        [PasswordResetTokenCreateArgs]
      >;
    };
    $transaction: jest.Mock<
      Promise<unknown>,
      [callback: (tx: PasswordResetTokenTransaction) => Promise<unknown>]
    >;
  };
  let tokenProvider: jest.Mocked<
    Pick<PasswordResetTokenProvider, 'generateRawToken' | 'hashToken'>
  >;
  let emailService: jest.Mocked<
    Pick<PasswordResetEmailService, 'sendPasswordResetEmail'>
  >;
  let rateLimitProvider: jest.Mocked<
    Pick<PasswordResetRateLimitProvider, 'consume'>
  >;
  let provider: ForgotPasswordProvider;

  beforeEach(() => {
    prismaService = {
      user: {
        findFirst: jest
          .fn<Promise<PasswordResetUser | null>, [unknown]>()
          .mockResolvedValue(user),
      },
      passwordResetToken: {
        updateMany: jest
          .fn<Promise<{ count: number }>, [PasswordResetTokenUpdateManyArgs]>()
          .mockResolvedValue({ count: 1 }),
        create: jest
          .fn<Promise<{ id: string }>, [PasswordResetTokenCreateArgs]>()
          .mockResolvedValue({ id: 'token-id' }),
      },
      $transaction: jest
        .fn<
          Promise<unknown>,
          [callback: (tx: PasswordResetTokenTransaction) => Promise<unknown>]
        >()
        .mockImplementation((callback) =>
          callback({
            passwordResetToken: prismaService.passwordResetToken,
          }),
        ),
    };
    tokenProvider = {
      generateRawToken: jest
        .fn<string, []>()
        .mockReturnValue('raw-reset-token'),
      hashToken: jest
        .fn<string, [string]>()
        .mockReturnValue('hashed-reset-token'),
    };
    emailService = {
      sendPasswordResetEmail: jest
        .fn<
          Promise<void>,
          [Parameters<PasswordResetEmailService['sendPasswordResetEmail']>[0]]
        >()
        .mockResolvedValue(undefined),
    };
    rateLimitProvider = {
      consume: jest.fn<void, [string]>(),
    };
    provider = new ForgotPasswordProvider(
      prismaService as unknown as PrismaService,
      tokenProvider,
      emailService as unknown as PasswordResetEmailService,
      rateLimitProvider as unknown as PasswordResetRateLimitProvider,
      appConfiguration as ConfigType<typeof appConfig>,
    );
  });

  it('returns a generic response and sends a reset email for an existing active user', async () => {
    const response = await provider.forgotPassword(
      { email: 'admin@example.com' },
      '127.0.0.1',
    );

    expect(response).toEqual({
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    });
    expect(rateLimitProvider.consume).toHaveBeenCalledWith(
      '127.0.0.1:admin@example.com',
    );
    const updateManyArgs =
      prismaService.passwordResetToken.updateMany.mock.calls[0]?.[0];
    const createArgs =
      prismaService.passwordResetToken.create.mock.calls[0]?.[0];

    expect(updateManyArgs).toMatchObject({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });
    expect(updateManyArgs?.data.usedAt).toBeInstanceOf(Date);
    expect(createArgs).toMatchObject({
      data: {
        userId: user.id,
        tokenHash: 'hashed-reset-token',
      },
    });
    expect(createArgs?.data.expiresAt).toBeInstanceOf(Date);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: user.email,
      resetUrl: 'http://localhost:5173/reset-password?token=raw-reset-token',
      expiresInMinutes: 30,
    } satisfies Parameters<
      PasswordResetEmailService['sendPasswordResetEmail']
    >[0]);
    expect(JSON.stringify(response)).not.toContain('raw-reset-token');
    expect(JSON.stringify(response)).not.toContain('hashed-reset-token');
  });

  it('returns the same generic response for an unknown email', async () => {
    prismaService.user.findFirst.mockResolvedValueOnce(null);

    const response = await provider.forgotPassword({
      email: 'missing@example.com',
    });

    expect(response).toEqual({
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    });
    expect(tokenProvider.generateRawToken).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('does not send reset email for inactive users', async () => {
    prismaService.user.findFirst.mockResolvedValueOnce({
      ...user,
      isActive: false,
    });

    const response = await provider.forgotPassword({
      email: 'admin@example.com',
    });

    expect(response).toEqual({
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    });
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('wraps unexpected failures', async () => {
    prismaService.user.findFirst.mockRejectedValueOnce(new Error('db down'));

    await expect(
      provider.forgotPassword({ email: 'admin@example.com' }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
