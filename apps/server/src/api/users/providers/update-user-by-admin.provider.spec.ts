import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminAction, AdminEntity, UserRole } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { safeUserSelect } from '../constants/safe-user-select.constant';
import { UpdateUserByAdminProvider } from './update-user-by-admin.provider';

const now = new Date('2026-08-21T12:00:00.000Z');
const targetUser = {
  id: 'target-user-id',
  firstName: 'Target',
  lastName: 'User',
  email: 'target@example.com',
  role: UserRole.EMPLOYEE,
  isActive: true,
  mustChangePassword: false,
  passwordChangedAt: now,
  createdAt: now,
  updatedAt: now,
};

type ExistingUser = {
  role: UserRole;
} | null;

type PrismaTxMock = {
  user: {
    findUnique: jest.Mock<Promise<ExistingUser>, [unknown]>;
    update: jest.Mock<Promise<typeof targetUser>, [unknown]>;
  };
  adminLog: {
    create: jest.Mock<Promise<unknown>, [unknown]>;
  };
};

describe('UpdateUserByAdminProvider role changes', () => {
  let prismaService: PrismaTxMock & {
    $transaction: jest.Mock<
      Promise<unknown>,
      [callback: (tx: PrismaTxMock) => unknown]
    >;
  };
  let provider: UpdateUserByAdminProvider;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest
          .fn<Promise<ExistingUser>, [unknown]>()
          .mockResolvedValue({ role: UserRole.ADMIN }),
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
              user: prismaService.user,
              adminLog: prismaService.adminLog,
            }),
          ),
        ),
    };
    provider = new UpdateUserByAdminProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('increments only the target session version and clears target refresh state when role changes', async () => {
    await expect(
      provider.updateUserByAdmin(
        targetUser.id,
        { role: UserRole.EMPLOYEE },
        'super-admin-id',
      ),
    ).resolves.toEqual(targetUser);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: targetUser.id,
      },
      select: {
        role: true,
      },
    });
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: targetUser.id,
      },
      data: {
        role: UserRole.EMPLOYEE,
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
        action: AdminAction.UPDATE,
        entity: AdminEntity.USER,
        entityId: targetUser.id,
      },
    });
  });

  it('does not invalidate sessions when the role value is unchanged', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      role: UserRole.ADMIN,
    });

    await expect(
      provider.updateUserByAdmin(
        targetUser.id,
        { role: UserRole.ADMIN },
        'super-admin-id',
      ),
    ).resolves.toEqual(targetUser);

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: targetUser.id,
      },
      data: {
        role: UserRole.ADMIN,
      },
      select: safeUserSelect,
    });
  });

  it('does not read role state for profile-only updates', async () => {
    await expect(
      provider.updateUserByAdmin(
        targetUser.id,
        { firstName: 'Renamed' },
        'super-admin-id',
      ),
    ).resolves.toEqual(targetUser);

    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: {
        id: targetUser.id,
      },
      data: {
        firstName: 'Renamed',
      },
      select: safeUserSelect,
    });
  });

  it('rejects empty update requests before starting a transaction', async () => {
    await expect(
      provider.updateUserByAdmin(targetUser.id, {}, 'super-admin-id'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('returns not found when a role-change target no longer exists', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      provider.updateUserByAdmin(
        targetUser.id,
        { role: UserRole.EMPLOYEE },
        'super-admin-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaService.user.update).not.toHaveBeenCalled();
  });
});
