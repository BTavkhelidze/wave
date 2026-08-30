import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  FindOutboundEmailsQueryDto,
  OutboundEmailSortOrder,
} from '../dto/find-outbound-emails-query.dto';
import {
  OutboundEmailListItem,
  outboundEmailListSelect,
} from './outbound-email-select.constant';

export type OutboundEmailsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type FindOutboundEmailsResponse = {
  data: OutboundEmailListItem[];
  meta: OutboundEmailsMeta;
};

@Injectable()
export class FindOutboundEmailsProvider {
  private readonly logger = new Logger(FindOutboundEmailsProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async findMany(
    query: FindOutboundEmailsQueryDto,
  ): Promise<FindOutboundEmailsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const sortOrder = query.sortOrder ?? OutboundEmailSortOrder.DESC;

    try {
      const [data, total] = await this.prismaService.$transaction([
        this.prismaService.outboundEmail.findMany({
          where,
          select: outboundEmailListSelect,
          orderBy: {
            createdAt: sortOrder,
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prismaService.outboundEmail.count({
          where,
        }),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      this.logPersistenceError(error);

      throw new InternalServerErrorException('Could not fetch outbound emails');
    }
  }

  private buildWhere(
    query: FindOutboundEmailsQueryDto,
  ): Prisma.OutboundEmailWhereInput {
    const where: Prisma.OutboundEmailWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        {
          recipientEmail: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          subject: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private logPersistenceError(error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Outbound email list failed: ${errorName}.`);
  }
}
