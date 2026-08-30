import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  AdminContactMessage,
  adminContactMessageSelect,
} from './contact-message-select.constant';

@Injectable()
export class FindContactMessageByIdProvider {
  private readonly logger = new Logger(FindContactMessageByIdProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async findOne(id: string): Promise<AdminContactMessage> {
    try {
      const contactMessage = await this.prismaService.contactMessage.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        select: adminContactMessageSelect,
      });

      if (!contactMessage) {
        throw new NotFoundException('Contact message not found');
      }

      return contactMessage;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError(error);

      throw new InternalServerErrorException('Could not fetch contact message');
    }
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Contact message detail fetch failed: ${errorName}.`);
  }
}
