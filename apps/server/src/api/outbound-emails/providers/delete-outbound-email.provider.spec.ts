import { NotFoundException } from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { DeleteOutboundEmailProvider } from './delete-outbound-email.provider';

describe('DeleteOutboundEmailProvider', () => {
  const emailId = 'ab5a4c0f-7e19-42c3-8b95-905599b46c25';
  const adminId = '99edc210-72d5-4969-9874-04269a600d77';

  let tx: {
    outboundEmail: {
      updateMany: jest.Mock<
        Promise<Prisma.BatchPayload>,
        [Prisma.OutboundEmailUpdateManyArgs]
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
  let provider: DeleteOutboundEmailProvider;

  beforeEach(() => {
    tx = {
      outboundEmail: {
        updateMany: jest
          .fn<
            Promise<Prisma.BatchPayload>,
            [Prisma.OutboundEmailUpdateManyArgs]
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
    provider = new DeleteOutboundEmailProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('soft deletes an outbound email history record and writes a safe audit log', async () => {
    await expect(provider.delete(emailId, adminId)).resolves.toBeUndefined();

    expect(tx.outboundEmail.updateMany).toHaveBeenCalledWith({
      where: {
        id: emailId,
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
        entity: AdminEntity.OUTBOUND_EMAIL,
        entityId: emailId,
      },
    });
  });

  it('returns not found for a missing or already deleted outbound email', async () => {
    tx.outboundEmail.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(provider.delete(emailId, adminId)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(tx.adminLog.create).not.toHaveBeenCalled();
  });
});
