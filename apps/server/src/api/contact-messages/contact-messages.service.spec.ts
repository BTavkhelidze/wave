import { MessageStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageProvider } from './providers/create-contact-message.provider';
import { FindContactMessagesProvider } from './providers/find-contact-messages.provider';
import { FindContactMessageByIdProvider } from './providers/find-contact-message-by-id.provider';
import { GetUnreadContactMessageCountProvider } from './providers/get-unread-contact-message-count.provider';
import { UpdateContactMessageStatusProvider } from './providers/update-contact-message-status.provider';

describe('ContactMessagesService', () => {
  const dto = {
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'I would like more information.',
  };
  const createdMessage = {
    id: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
    fullName: dto.fullName,
    email: dto.email,
    phone: null,
    subject: null,
    message: dto.message,
    status: MessageStatus.UNREAD,
    createdAt: new Date('2026-08-15T00:00:00.000Z'),
  };

  let createContactMessageProvider: {
    create: jest.Mock<Promise<typeof createdMessage>, [typeof dto]>;
  };
  let mailService: {
    sendNewContactMessageNotification: jest.Mock<
      Promise<void>,
      [typeof createdMessage]
    >;
  };
  let service: ContactMessagesService;

  beforeEach(() => {
    createContactMessageProvider = {
      create: jest
        .fn<Promise<typeof createdMessage>, [typeof dto]>()
        .mockResolvedValue(createdMessage),
    };
    mailService = {
      sendNewContactMessageNotification: jest
        .fn<Promise<void>, [typeof createdMessage]>()
        .mockResolvedValue(),
    };
    service = new ContactMessagesService(
      createContactMessageProvider as unknown as CreateContactMessageProvider,
      {} as FindContactMessagesProvider,
      {} as FindContactMessageByIdProvider,
      {} as GetUnreadContactMessageCountProvider,
      {} as UpdateContactMessageStatusProvider,
      mailService as unknown as MailService,
    );
  });

  it('sends an admin notification after persistence succeeds', async () => {
    await expect(service.create(dto)).resolves.toEqual({
      message: 'Your message has been received successfully.',
      data: {
        id: createdMessage.id,
        status: MessageStatus.UNREAD,
        createdAt: createdMessage.createdAt,
      },
    });

    expect(mailService.sendNewContactMessageNotification).toHaveBeenCalledWith(
      createdMessage,
    );
  });

  it('does not send an admin notification when persistence fails', async () => {
    createContactMessageProvider.create.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(service.create(dto)).rejects.toThrow('database unavailable');
    expect(
      mailService.sendNewContactMessageNotification,
    ).not.toHaveBeenCalled();
  });

  it('still returns success when the admin notification fails', async () => {
    mailService.sendNewContactMessageNotification.mockRejectedValueOnce(
      new Error('SMTP failed'),
    );

    await expect(service.create(dto)).resolves.toEqual({
      message: 'Your message has been received successfully.',
      data: {
        id: createdMessage.id,
        status: MessageStatus.UNREAD,
        createdAt: createdMessage.createdAt,
      },
    });
  });
});
