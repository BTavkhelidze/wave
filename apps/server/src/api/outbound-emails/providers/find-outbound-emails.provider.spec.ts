import { OutboundEmailStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { FindOutboundEmailsProvider } from './find-outbound-emails.provider';

describe('FindOutboundEmailsProvider', () => {
  it('excludes deleted outbound email records from normal lists', async () => {
    const prismaService = {
      $transaction: jest.fn().mockResolvedValue([[], 0]),
      outboundEmail: {
        findMany: jest.fn<unknown, [Prisma.OutboundEmailFindManyArgs]>(),
        count: jest.fn<unknown, [Prisma.OutboundEmailCountArgs]>(),
      },
    };
    const provider = new FindOutboundEmailsProvider(
      prismaService as unknown as PrismaService,
    );

    await provider.findMany({ status: OutboundEmailStatus.SENT });

    expect(prismaService.outboundEmail.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: OutboundEmailStatus.SENT,
        },
      }),
    );
    expect(prismaService.outboundEmail.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: OutboundEmailStatus.SENT,
      },
    });
  });
});
