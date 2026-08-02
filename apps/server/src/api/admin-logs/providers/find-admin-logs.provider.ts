import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  AdminLogSortOrder,
  FindAdminLogsQueryDto,
} from '../dtos/find-admin-logs-query.dto';

const adminLogSelect = {
  id: true,
  userId: true,
  action: true,
  entity: true,
  entityId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AdminLogSelect;

export type AdminLogItem = Prisma.AdminLogGetPayload<{
  select: typeof adminLogSelect;
}>;

export type AdminLogsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type FindAdminLogsResponse = {
  data: AdminLogItem[];
  pagination: AdminLogsPagination;
};

@Injectable()
export class FindAdminLogsProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async findAdminLogs(
    query: FindAdminLogsQueryDto,
  ): Promise<FindAdminLogsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const userId = this.resolveUserId(query);
    const where = this.buildWhere(query, userId);

    try {
      const [data, totalItems] = await this.prismaService.$transaction([
        this.prismaService.adminLog.findMany({
          where,
          orderBy: {
            createdAt: query.sortOrder ?? query.sort ?? AdminLogSortOrder.DESC,
          },
          skip: (page - 1) * limit,
          take: limit,
          select: adminLogSelect,
        }),
        this.prismaService.adminLog.count({
          where,
        }),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not fetch admin logs');
    }
  }

  private resolveUserId(query: FindAdminLogsQueryDto): string | undefined {
    if (query.userId && query.adminId && query.userId !== query.adminId) {
      throw new BadRequestException('userId and adminId must match');
    }

    return query.userId ?? query.adminId;
  }

  private buildWhere(
    query: FindAdminLogsQueryDto,
    userId?: string,
  ): Prisma.AdminLogWhereInput {
    const where: Prisma.AdminLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.entity) {
      where.entity = query.entity;
    }

    if (query.dateFrom || query.dateTo) {
      if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
        throw new BadRequestException('dateFrom must be before dateTo');
      }

      where.createdAt = {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {}),
      };
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          userId: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          entityId: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            is: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    return where;
  }
}
