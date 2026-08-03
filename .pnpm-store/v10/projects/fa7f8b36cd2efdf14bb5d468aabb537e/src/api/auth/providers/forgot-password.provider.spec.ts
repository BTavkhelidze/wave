import { InternalServerErrorException } from '@nestjs/common';
import {
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  ForgotPasswordProvider,
} from './forgot-password.provider';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { PasswordResetTokenProvider } from './password-reset-token.provider';
import { PasswordResetEmailService } from '../email/password-reset-email.service';
import { PasswordResetRateLimitProvider } from './password-reset-rate-limit.provider';

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
      findFirst: jest.Mock;
    };
    passwordResetToken: {
      updateMany: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let tokenProvider: {
    generateRawToken: jest.Mock<string, []>;
    hashToken: jest.Mock<string, [string]>;
  };
  let emailService: {
    sendPasswordResetEmail: jest.Mock<Promise<void>, [unknown]>;
  };
  let rateLimitProvider: {
    consume: jest.Mock<void, [string]>;
  };
  let provider: ForgotPasswordProvider;

  beforeEach(() => {
    prismaService = {
      user: {
        findFirst: jest.fn().mockResolvedValue(user),
      },
      passwordResetToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'token-id' }),
      },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          passwordResetToken: prismaService.passwordResetToken,
        }),
      ),
    };
    tokenProvider = {
      generateRawToken: jest.fn().mockReturnValue('raw-reset-token'),
      hashToken: jest.fn().mockReturnValue('hashed-reset-token'),
    };
    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    rateLimitProvider = {
      consume: jest.fn(),
    };
    provider = new ForgotPasswordProvider(
      prismaService as unknown as PrismaService,
      tokenProvider,
      emailService as unknown as PasswordResetEmailService,
      rateLimitProvider as unknown as PasswordResetRateLimitProvider,
      appConfiguration as never,
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
    expect(prismaService.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: expect.any(Date),
      },
    });
    expect(prismaService.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        tokenHash: 'hashed-reset-token',
        expiresAt: expect.any(Date),
      },
    });
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: user.email,
      resetUrl: 'http://localhost:5173/reset-password?token=raw-reset-token',
      expiresInMinutes: 30,
    });
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
