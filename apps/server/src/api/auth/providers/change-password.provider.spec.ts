import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ChangePasswordProvider } from './change-password.provider';

describe('ChangePasswordProvider', () => {
  const now = new Date('2026-08-08T10:00:00.000Z');
  const userRecord = {
    id: 'user-id',
    password: 'hashed-current-password',
  };

  type PrismaTxMock = {
    user: {
      findUnique: jest.Mock<Promise<unknown>, [unknown]>;
      update: jest.Mock<Promise<unknown>, [unknown]>;
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
  let provider: ChangePasswordProvider;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaService = {
      user: {
        findUnique: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue(userRecord),
        update: jest
          .fn<Promise<unknown>, [unknown]>()
          .mockResolvedValue({ id: userRecord.id }),
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
        .mockResolvedValue('hashed-new-password'),
      comparePassword: jest
        .fn<Promise<boolean>, [string, string]>()
        .mockResolvedValue(false),
    };
    provider = new ChangePasswordProvider(
      prismaService as unknown as PrismaService,
      hashProvider,
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
      provider.changePassword(userRecord.id, {
        currentPassword: 'Current-password1!',
        newPassword: 'N3w-password!',
      }),
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
  });

  it('rejects an incorrect current password without updating the password', async () => {
    hashProvider.comparePassword.mockResolvedValueOnce(false);

    await expect(
      provider.changePassword(userRecord.id, {
        currentPassword: 'Wrong-password1!',
        newPassword: 'N3w-password!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
    expect(prismaService.user.update).not.toHaveBeenCalled();
  });

  it('supports the mandatory initial password change flow when mustChangePassword is set', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...userRecord,
      mustChangePassword: true,
    });
    hashProvider.comparePassword.mockResolvedValueOnce(false);

    await expect(
      provider.changeInitialPassword(userRecord.id, {
        newPassword: 'N3w-password!',
      }),
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
      },
    });
  });

  it('rejects initial password change when mustChangePassword is not set', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      ...userRecord,
      mustChangePassword: false,
    });

    await expect(
      provider.changeInitialPassword(userRecord.id, {
        newPassword: 'N3w-password!',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(hashProvider.hashPassword).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});
