import { InternalServerErrorException } from '@nestjs/common';
import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  ContactMessageCreated,
  CreateContactMessageProvider,
} from './create-contact-message.provider';

describe('CreateContactMessageProvider', () => {
  const dto = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+995555123456',
    subject: 'Fire protection system',
    message: 'I would like more information about this service.',
  };
  const createdMessage: ContactMessageCreated = {
    id: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
    fullName: dto.fullName,
    email: dto.email,
    phone: dto.phone,
    subject: dto.subject,
    message: dto.message,
    status: MessageStatus.UNREAD,
    createdAt: new Date('2026-08-15T00:00:00.000Z'),
  };

  let prismaService: {
    contactMessage: {
      create: jest.Mock<
        Promise<ContactMessageCreated>,
        [Prisma.ContactMessageCreateArgs]
      >;
    };
  };
  let provider: CreateContactMessageProvider;

  beforeEach(() => {
    prismaService = {
      contactMessage: {
        create: jest
          .fn<
            Promise<ContactMessageCreated>,
            [Prisma.ContactMessageCreateArgs]
          >()
          .mockResolvedValue(createdMessage),
      },
    };
    provider = new CreateContactMessageProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('creates an unread contact message with only public form fields', async () => {
    await expect(provider.create(dto)).resolves.toEqual(createdMessage);

    expect(prismaService.contactMessage.create).toHaveBeenCalledWith({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        status: MessageStatus.UNREAD,
        readAt: null,
        archivedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });
  });

  it('persists empty optional fields as null', async () => {
    await provider.create({
      fullName: dto.fullName,
      email: dto.email,
      message: dto.message,
    });

    const createArgs = prismaService.contactMessage.create.mock.calls[0]?.[0];

    expect(createArgs?.data).toMatchObject({
      phone: null,
      subject: null,
    });
  });

  it('returns a safe server error when persistence fails', async () => {
    prismaService.contactMessage.create.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(provider.create(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
