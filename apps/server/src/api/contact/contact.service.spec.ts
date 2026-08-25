import { InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  const contactDto = {
    name: ' John Doe ',
    email: ' JOHN@example.com ',
    message: ' I would like to discuss a project. ',
  };
  const persistedMessage = {
    id: 'contact-message-id',
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'I would like to discuss a project.',
  };

  let prismaService: {
    contactMessage: {
      create: jest.Mock<Promise<typeof persistedMessage>, [unknown]>;
    };
  };
  let mailService: {
    sendContactMessage: jest.Mock<Promise<void>, [unknown]>;
  };
  let service: ContactService;

  beforeEach(() => {
    prismaService = {
      contactMessage: {
        create: jest
          .fn<Promise<typeof persistedMessage>, [unknown]>()
          .mockResolvedValue(persistedMessage),
      },
    };
    mailService = {
      sendContactMessage: jest
        .fn<Promise<void>, [unknown]>()
        .mockResolvedValue(),
    };
    service = new ContactService(
      prismaService as unknown as PrismaService,
      mailService as unknown as MailService,
    );
  });

  it('persists a valid contact message and sends a notification email', async () => {
    await expect(service.createContactMessage(contactDto)).resolves.toEqual({
      id: persistedMessage.id,
      message: 'Contact message received successfully',
    });

    expect(prismaService.contactMessage.create).toHaveBeenCalledWith({
      data: {
        fullName: 'John Doe',
        email: 'john@example.com',
        message: 'I would like to discuss a project.',
      },
    });
    expect(mailService.sendContactMessage).toHaveBeenCalledWith({
      name: persistedMessage.fullName,
      email: persistedMessage.email,
      message: persistedMessage.message,
    });
  });

  it('returns success when notification email fails after persistence', async () => {
    mailService.sendContactMessage.mockRejectedValueOnce(
      new Error('SMTP authentication failed'),
    );

    await expect(service.createContactMessage(contactDto)).resolves.toEqual({
      id: persistedMessage.id,
      message: 'Contact message received successfully',
    });

    expect(prismaService.contactMessage.create).toHaveBeenCalledTimes(1);
  });

  it('returns a safe server error when persistence fails', async () => {
    prismaService.contactMessage.create.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(
      service.createContactMessage(contactDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(mailService.sendContactMessage).not.toHaveBeenCalled();
  });
});
