import { NotFoundException } from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { DeleteContactMessageProvider } from './delete-contact-message.provider';

describe('DeleteContactMessageProvider', () => {
  const messageId = 'ab5a4c0f-7e19-42c3-8b95-905599b46c25';
  const adminId = '99edc210-72d5-4969-9874-04269a600d77';

  let tx: {
    contactMessage: {
      updateMany: jest.Mock<
        Promise<Prisma.BatchPayload>,
        [Prisma.ContactMessageUpdateManyArgs]
      >;
    };
    adminLog: {
      create: jest.Mock<Promise<{ id: string }>, [Prisma.AdminLogCreateArgs]>;
    };
  };
  let prismaService: {
    $transaction: jest.Mock<
      Promise<void>,
      [(txClient: typeof tx) => Promise<void>]
    >;
  };
  let provider: DeleteContactMessageProvider;

  beforeEach(() => {
    tx = {
      contactMessage: {
        updateMany: jest
          .fn<
            Promise<Prisma.BatchPayload>,
            [Prisma.ContactMessageUpdateManyArgs]
          >()
          .mockResolvedValue({ count: 1 }),
      },
      adminLog: {
        create: jest
          .fn<Promise<{ id: string }>, [Prisma.AdminLogCreateArgs]>()
          .mockResolvedValue({ id: 'log-id' }),
      },
    };
    prismaService = {
      $transaction: jest.fn((callback) => callback(tx)),
    };
    provider = new DeleteContactMessageProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('soft deletes a non-deleted contact message and writes a safe audit log', async () => {
    await expect(provider.delete(messageId, adminId)).resolves.toBeUndefined();

    expect(tx.contactMessage.updateMany).toHaveBeenCalledWith({
      where: {
        id: messageId,
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date) as Date,
        deletedByUserId: adminId,
      },
    });
    expect(tx.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        action: AdminAction.DELETE,
        entity: AdminEntity.CONTACT_MESSAGE,
        entityId: messageId,
      },
    });
  });

  it('returns not found for a missing or already deleted contact message', async () => {
    tx.contactMessage.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(provider.delete(messageId, adminId)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(tx.adminLog.create).not.toHaveBeenCalled();
  });
});
