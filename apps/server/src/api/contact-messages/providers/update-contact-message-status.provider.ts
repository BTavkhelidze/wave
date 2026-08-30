import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminAction,
  AdminEntity,
  MessageStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  AdminContactMessage,
  adminContactMessageSelect,
} from './contact-message-select.constant';

@Injectable()
export class UpdateContactMessageStatusProvider {
  private readonly logger = new Logger(UpdateContactMessageStatusProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async updateStatus(
    id: string,
    status: MessageStatus,
    adminId: string,
  ): Promise<AdminContactMessage> {
    const now = new Date();

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const contactMessage = await tx.contactMessage.update({
          where: {
            id,
            deletedAt: null,
          },
          data: this.buildStatusUpdateData(status, now),
          select: adminContactMessageSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action:
              status === MessageStatus.ARCHIVED
                ? AdminAction.ARCHIVE
                : AdminAction.UPDATE,
            entity: AdminEntity.CONTACT_MESSAGE,
            entityId: contactMessage.id,
          },
        });

        return contactMessage;
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Contact message not found');
      }

      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError(error);

      throw new InternalServerErrorException(
        'Could not update contact message status',
      );
    }
  }

  private buildStatusUpdateData(
    status: MessageStatus,
    now: Date,
  ): Prisma.ContactMessageUpdateInput {
    if (status === MessageStatus.READ) {
      return {
        status,
        readAt: now,
        archivedAt: null,
      };
    }

    if (status === MessageStatus.UNREAD) {
      return {
        status,
        readAt: null,
        archivedAt: null,
      };
    }

    return {
      status,
      archivedAt: now,
    };
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Contact message status update failed: ${errorName}.`);
  }
}
