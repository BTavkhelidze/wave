import { ForbiddenException } from '@nestjs/common';
import { AdminAction, AdminEntity, UserRole } from '@prisma/client';
import { HashProvider } from 'src/api/auth/providers/hash.provider';
import { MailService } from 'src/api/mail/mail.service';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { safeUserSelect } from '../constants/safe-user-select.constant';
import { ResetUserPasswordByAdminProvider } from './reset-user-password-by-admin.provider';

describe('ResetUserPasswordByAdminProvider', () => {
  const now = new Date('2026-08-20T12:00:00.000Z');
  const targetUser = {
    id: 'target-user-id',
    firstName: 'Target',
    lastName: 'Admin',
    email: 'target@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    mustChangePassword: true,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  type ExistingUser = {
    id: string;
    email: string;
    role: UserRole;
  } | null;
  type PrismaTxMock = {
    passwordResetToken: {
      updateMany: jest.Mock<Promise<unknown>, [unknown]>;
    };
    user: {
      findUnique: jest.Mock<Promise<ExistingUser>, [unknown]>;
      update: jest.Mock<Promise<typeof targetUser>, [unknown]>;
    };
    adminLog: {
      create: jest.Mock<Promise<unknown>, [unknown]>;
    };
  };

  let prismaService: PrismaTxMock & {
    $transaction: jest.Mock<
      Promise<unknown>,
      [callback: (tx: PrismaTxMock) => unknown]
    >;
  };
  let provider: ResetUserPasswordByAdminProvider;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaService = {
      passwordResetToken: {
        updateMany: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: jest
          .fn<Promise<ExistingUser>, [unknown]>()
          .mockResolvedValue({
            id: targetUser.id,
            email: targetUser.email,
            role: targetUser.role,
          }),
        update: jest
          .fn<Promise<typeof targetUser>, [unknown]>()
          .mockResolvedValue(targetUser),
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
              passwordResetToken: prismaService.passwordResetToken,
              user: prismaService.user,
              adminLog: prismaService.adminLog,
            }),
          ),
        ),
    };
    provider = new ResetUserPasswordByAdminProvider(
      prismaService as unknown as PrismaService,
      {
        hashPassword: jest
          .fn<Promise<string>, [string]>()
          .mockResolvedValue('hashed-temporary-password'),
      } as unknown as HashProvider,
      {
        sendAdminTemporaryPasswordEmail: jest
          .fn<Promise<void>, [unknown]>()
          .mockResolvedValue(undefined),
      } as unknown as MailService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('increments only the target user session version and clears target refresh state', async () => {
    await expect(
      provider.resetUserPasswordByAdmin(targetUser.id, 'super-admin-id'),
    ).resolves.toMatchObject({
      user: targetUser,
      emailSent: true,
    });

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: targetUser.id,
      },
      data: {
        password: 'hashed-temporary-password',
        mustChangePassword: true,
        passwordChangedAt: now,
        hashedRefreshToken: null,
        sessionVersion: {
          increment: 1,
        },
      },
      select: safeUserSelect,
    });
    expect(prismaService.user.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'super-admin-id',
        },
      }),
    );
    expect(prismaService.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'super-admin-id',
        action: AdminAction.PASSWORD_CHANGE,
        entity: AdminEntity.USER,
        entityId: targetUser.id,
      },
    });
  });

  it('does not increment when a SUPER_ADMIN target is rejected', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      id: targetUser.id,
      email: targetUser.email,
      role: UserRole.SUPER_ADMIN,
    });

    await expect(
      provider.resetUserPasswordByAdmin(targetUser.id, 'super-admin-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaService.user.update).not.toHaveBeenCalled();
  });
});
