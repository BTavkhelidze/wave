import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  ContactMessageSortOrder,
  FindContactMessagesQueryDto,
} from '../dto/find-contact-messages-query.dto';
import {
  AdminContactMessage,
  adminContactMessageSelect,
} from './contact-message-select.constant';

export type ContactMessagesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type FindContactMessagesResponse = {
  data: AdminContactMessage[];
  meta: ContactMessagesMeta;
};

@Injectable()
export class FindContactMessagesProvider {
  private readonly logger = new Logger(FindContactMessagesProvider.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async findMany(
    query: FindContactMessagesQueryDto,
  ): Promise<FindContactMessagesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);
    const sortOrder = query.sortOrder ?? ContactMessageSortOrder.DESC;

    try {
      const [data, total] = await this.prismaService.$transaction([
        this.prismaService.contactMessage.findMany({
          where,
          select: adminContactMessageSelect,
          orderBy: {
            createdAt: sortOrder,
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prismaService.contactMessage.count({ where }),
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
      this.logPersistenceError('list', error);

      throw new InternalServerErrorException(
        'Could not fetch contact messages',
      );
    }
  }

  private buildWhere(
    query: FindContactMessagesQueryDto,
  ): Prisma.ContactMessageWhereInput {
    const where: Prisma.ContactMessageWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = {
        not: MessageStatus.ARCHIVED,
      };
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
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
        {
          message: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private logPersistenceError(action: 'list', error: unknown): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    this.logger.error(`Contact message ${action} failed: ${errorName}.`);
  }
}
