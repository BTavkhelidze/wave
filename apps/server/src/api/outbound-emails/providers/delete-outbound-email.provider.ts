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
export class DeleteOutboundEmailProvider {
  private readonly logger = new Logger(DeleteOutboundEmailProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async delete(id: string, adminId: string): Promise<void> {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const result = await tx.outboundEmail.updateMany({
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
          throw new NotFoundException('Outbound email not found');
        }

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.DELETE,
            entity: AdminEntity.OUTBOUND_EMAIL,
            entityId: id,
          },
        });
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError(error);

      throw new InternalServerErrorException('Could not delete outbound email');
    }
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Outbound email delete failed: ${errorName}.`);
  }
}
