import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { FindContactMessageByIdProvider } from './find-contact-message-by-id.provider';

describe('FindContactMessageByIdProvider', () => {
  it('does not return a soft-deleted contact message by ID', async () => {
    const prismaService = {
      contactMessage: {
        findFirst: jest
          .fn<Promise<null>, [Prisma.ContactMessageFindFirstArgs]>()
          .mockResolvedValue(null),
      },
    };
    const provider = new FindContactMessageByIdProvider(
      prismaService as unknown as PrismaService,
    );

    await expect(provider.findOne('message-id')).rejects.toThrow(
      'Contact message not found',
    );

    expect(prismaService.contactMessage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'message-id',
          deletedAt: null,
        },
      }),
    );
  });
});
