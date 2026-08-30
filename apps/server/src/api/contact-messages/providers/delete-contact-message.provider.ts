import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

@Injectable()
export class DeleteContactMessageProvider {
  private readonly logger = new Logger(DeleteContactMessageProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async delete(id: string, adminId: string): Promise<void> {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const result = await tx.contactMessage.updateMany({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedByUserId: adminId,
          },
        });

        if (result.count === 0) {
          throw new NotFoundException('Contact message not found');
        }

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.DELETE,
            entity: AdminEntity.CONTACT_MESSAGE,
            entityId: id,
          },
        });
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError(error);

      throw new InternalServerErrorException(
        'Could not delete contact message',
      );
    }
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Contact message delete failed: ${errorName}.`);
  }
}
