import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { GetUnreadContactMessageCountProvider } from './get-unread-contact-message-count.provider';

describe('GetUnreadContactMessageCountProvider', () => {
  it('excludes deleted contact messages from unread counts', async () => {
    const prismaService = {
      contactMessage: {
        count: jest
          .fn<Promise<number>, [Prisma.ContactMessageCountArgs]>()
          .mockResolvedValue(3),
      },
    };
    const provider = new GetUnreadContactMessageCountProvider(
      prismaService as unknown as PrismaService,
    );

    await expect(provider.getCount()).resolves.toEqual({ count: 3 });
    expect(prismaService.contactMessage.count).toHaveBeenCalledWith({
      where: {
        status: MessageStatus.UNREAD,
        deletedAt: null,
      },
    });
  });
});
