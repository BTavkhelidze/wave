import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { CreateContactMessageDto } from '../dto/create-contact-message.dto';

const contactMessageCreatedSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  status: true,
  createdAt: true,
} satisfies Prisma.ContactMessageSelect;

export type ContactMessageCreated = Prisma.ContactMessageGetPayload<{
  select: typeof contactMessageCreatedSelect;
}>;

@Injectable()
export class CreateContactMessageProvider {
  private readonly logger = new Logger(CreateContactMessageProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    createContactMessageDto: CreateContactMessageDto,
  ): Promise<ContactMessageCreated> {
    try {
      return await this.prismaService.contactMessage.create({
        data: {
          fullName: createContactMessageDto.fullName,
          email: createContactMessageDto.email,
          phone: createContactMessageDto.phone ?? null,
          subject: createContactMessageDto.subject ?? null,
          message: createContactMessageDto.message,
          status: MessageStatus.UNREAD,
          readAt: null,
          archivedAt: null,
        },
        select: contactMessageCreatedSelect,
      });
    } catch (error: unknown) {
      this.logPersistenceError(error);

      throw new InternalServerErrorException(
        'Could not process contact message',
      );
    }
  }

  private logPersistenceError(error: unknown): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    this.logger.error(`Contact message persistence failed: ${errorName}.`);
  }
}
