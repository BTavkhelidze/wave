import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { FindOutboundEmailByIdProvider } from './find-outbound-email-by-id.provider';

describe('FindOutboundEmailByIdProvider', () => {
  it('does not return a soft-deleted outbound email by ID', async () => {
    const prismaService = {
      outboundEmail: {
        findFirst: jest
          .fn<Promise<null>, [Prisma.OutboundEmailFindFirstArgs]>()
          .mockResolvedValue(null),
      },
    };
    const provider = new FindOutboundEmailByIdProvider(
      prismaService as unknown as PrismaService,
    );

    await expect(provider.findOne('email-id')).rejects.toThrow(
      'Outbound email not found',
    );

    expect(prismaService.outboundEmail.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'email-id',
          deletedAt: null,
        },
      }),
    );
  });
});
