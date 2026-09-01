import { Injectable, Logger } from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { FindContactMessagesQueryDto } from './dto/find-contact-messages-query.dto';
import type { AdminContactMessage } from './providers/contact-message-select.constant';
import { CreateContactMessageProvider } from './providers/create-contact-message.provider';
import { DeleteContactMessageProvider } from './providers/delete-contact-message.provider';
import {
  FindContactMessagesProvider,
  type FindContactMessagesResponse,
} from './providers/find-contact-messages.provider';
import { FindContactMessageByIdProvider } from './providers/find-contact-message-by-id.provider';
import {
  GetUnreadContactMessageCountProvider,
  type UnreadContactMessageCountResponse,
} from './providers/get-unread-contact-message-count.provider';
import { UpdateContactMessageStatusProvider } from './providers/update-contact-message-status.provider';

export type CreateContactMessageResponse = {
  message: string;
  data: {
    id: string;
    status: MessageStatus;
    createdAt: Date;
  };
};

@Injectable()
export class ContactMessagesService {
  private readonly logger = new Logger(ContactMessagesService.name);

  constructor(
    private readonly createContactMessageProvider: CreateContactMessageProvider,
    private readonly deleteContactMessageProvider: DeleteContactMessageProvider,
    private readonly findContactMessagesProvider: FindContactMessagesProvider,
    private readonly findContactMessageByIdProvider: FindContactMessageByIdProvider,
    private readonly getUnreadContactMessageCountProvider: GetUnreadContactMessageCountProvider,
    private readonly updateContactMessageStatusProvider: UpdateContactMessageStatusProvider,
    private readonly mailService: MailService,
  ) {}

  public async create(
    createContactMessageDto: CreateContactMessageDto,
  ): Promise<CreateContactMessageResponse> {
    const contactMessage = await this.createContactMessageProvider.create(
      createContactMessageDto,
    );

    try {
      await this.mailService.sendNewContactMessageNotification(contactMessage);
    } catch (error: unknown) {
      this.logNotificationFailure(contactMessage.id, error);
    }

    return {
      message: 'Your message has been received successfully.',
      data: {
        id: contactMessage.id,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
    };
  }

  public findAdmin(
    query: FindContactMessagesQueryDto,
  ): Promise<FindContactMessagesResponse> {
    return this.findContactMessagesProvider.findMany(query);
  }

  public findAdminById(id: string): Promise<AdminContactMessage> {
    return this.findContactMessageByIdProvider.findOne(id);
  }

  public delete(id: string, adminId: string): Promise<void> {
    return this.deleteContactMessageProvider.delete(id, adminId);
  }

  public getUnreadCount(): Promise<UnreadContactMessageCountResponse> {
    return this.getUnreadContactMessageCountProvider.getCount();
  }

  public updateStatus(
    id: string,
    status: MessageStatus,
    adminId: string,
  ): Promise<AdminContactMessage> {
    return this.updateContactMessageStatusProvider.updateStatus(
      id,
      status,
      adminId,
    );
  }

  private logNotificationFailure(
    contactMessageId: string,
    error: unknown,
  ): void {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(
      `Contact message notification failed for message ${contactMessageId} with ${errorCode}.`,
    );
  }
}
