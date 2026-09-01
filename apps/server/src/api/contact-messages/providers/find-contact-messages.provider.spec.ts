import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { FindContactMessagesProvider } from './find-contact-messages.provider';

describe('FindContactMessagesProvider', () => {
  let prismaService: {
    $transaction: jest.Mock<Promise<[[], number]>, [unknown[]]>;
    contactMessage: {
      findMany: jest.Mock<unknown, [Prisma.ContactMessageFindManyArgs]>;
      count: jest.Mock<unknown, [Prisma.ContactMessageCountArgs]>;
    };
  };
  let provider: FindContactMessagesProvider;

  beforeEach(() => {
    prismaService = {
      $transaction: jest
        .fn<Promise<[[], number]>, [unknown[]]>()
        .mockResolvedValue([[], 0]),
      contactMessage: {
        findMany: jest.fn<unknown, [Prisma.ContactMessageFindManyArgs]>(),
        count: jest.fn<unknown, [Prisma.ContactMessageCountArgs]>(),
      },
    };
    provider = new FindContactMessagesProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('excludes deleted contact messages from normal lists', async () => {
    await provider.findMany({ status: MessageStatus.UNREAD });

    expect(prismaService.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: MessageStatus.UNREAD,
        },
      }),
    );
    expect(prismaService.contactMessage.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: MessageStatus.UNREAD,
      },
    });
  });
});
