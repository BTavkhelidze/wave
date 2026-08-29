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
  OutboundEmailDetail,
  outboundEmailDetailSelect,
} from './outbound-email-select.constant';

@Injectable()
export class FindOutboundEmailByIdProvider {
  private readonly logger = new Logger(FindOutboundEmailByIdProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async findOne(id: string): Promise<OutboundEmailDetail> {
    try {
      const outboundEmail = await this.prismaService.outboundEmail.findUnique({
        where: {
          id,
        },
        select: outboundEmailDetailSelect,
      });

      if (!outboundEmail) {
        throw new NotFoundException('Outbound email not found');
      }

      return outboundEmail;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError(error);

      throw new InternalServerErrorException('Could not fetch outbound email');
    }
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Outbound email detail failed: ${errorName}.`);
  }
}
