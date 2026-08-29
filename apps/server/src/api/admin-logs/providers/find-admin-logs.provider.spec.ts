import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  AdminLogItem,
  FindAdminLogsProvider,
} from './find-admin-logs.provider';
import { AdminLogSortOrder } from '../dtos/find-admin-logs-query.dto';

describe('FindAdminLogsProvider', () => {
  type AdminLogTransactionOperation = Promise<AdminLogItem[]> | Promise<number>;

  const createdAt = new Date('2026-07-30T08:45:12.000Z');
  const actorUserId = '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b';
  const log: AdminLogItem = {
    id: '6dcdde8e-1c4f-4631-9077-28b7a71ebf6a',
    userId: actorUserId,
    action: AdminAction.CREATE,
    entity: AdminEntity.USER,
    entityId: '0479e6b6-25a1-4d28-8ccf-a215c7de9c52',
    createdAt,
    user: {
      id: actorUserId,
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
    },
  };

  let findManyMock: jest.Mock<
    Promise<AdminLogItem[]>,
    [Prisma.AdminLogFindManyArgs]
  >;
  let countMock: jest.Mock<Promise<number>, [Prisma.AdminLogCountArgs]>;
  let transactionMock: jest.Mock<
    Promise<[AdminLogItem[], number]>,
    [AdminLogTransactionOperation[]]
  >;
  let prismaService: {
    adminLog: {
      findMany: jest.Mock<
        Promise<AdminLogItem[]>,
        [Prisma.AdminLogFindManyArgs]
      >;
      count: jest.Mock<Promise<number>, [Prisma.AdminLogCountArgs]>;
    };
    $transaction: jest.Mock<
      Promise<[AdminLogItem[], number]>,
      [Array<Promise<AdminLogItem[]> | Promise<number>>]
    >;
  };
  let provider: FindAdminLogsProvider;

  beforeEach(() => {
    findManyMock = jest
      .fn<Promise<AdminLogItem[]>, [Prisma.AdminLogFindManyArgs]>()
      .mockResolvedValue([log]);
    countMock = jest
      .fn<Promise<number>, [Prisma.AdminLogCountArgs]>()
      .mockResolvedValue(21);
    transactionMock = jest
      .fn<Promise<[AdminLogItem[], number]>, [AdminLogTransactionOperation[]]>()
      .mockResolvedValue([[log], 21]);
    prismaService = {
      adminLog: {
        findMany: findManyMock,
        count: countMock,
      },
      $transaction: transactionMock,
    };
    provider = new FindAdminLogsProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('uses sensible pagination and newest-first defaults', async () => {
    const response = await provider.findAdminLogs({});

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: {
          createdAt: AdminLogSortOrder.DESC,
        },
        skip: 0,
        take: 10,
      }),
    );
    expect(countMock).toHaveBeenCalledWith({
      where: {},
    });
    expect(response).toEqual({
      data: [log],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 21,
        totalPages: 3,
      },
    });
  });

  it('supports pagination and ascending createdAt sorting', async () => {
    await provider.findAdminLogs({
      page: 2,
      limit: 5,
      sortOrder: AdminLogSortOrder.ASC,
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: AdminLogSortOrder.ASC,
        },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('builds Prisma filters for actor, action, entity, and date range', async () => {
    const dateFrom = new Date('2026-07-01T00:00:00.000Z');
    const dateTo = new Date('2026-07-30T23:59:59.999Z');

    await provider.findAdminLogs({
      userId: actorUserId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.USER,
      dateFrom,
      dateTo,
    });

    const expectedWhere: Prisma.AdminLogWhereInput = {
      userId: actorUserId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.USER,
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    };

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
      }),
    );
    expect(countMock).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('supports the adminId alias for actor filtering', async () => {
    await provider.findAdminLogs({
      adminId: actorUserId,
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: actorUserId,
        },
      }),
    );
  });

  it('supports text search across log ids, entity ids, actor ids, and email', async () => {
    await provider.findAdminLogs({
      search: ' admin@example.com ',
    });

    const findManyArgs = findManyMock.mock.calls[0]?.[0];

    expect(findManyArgs?.where?.OR).toEqual(
      expect.arrayContaining([
        {
          user: {
            is: {
              email: {
                contains: 'admin@example.com',
                mode: 'insensitive',
              },
            },
          },
        },
      ]),
    );
  });

  it('rejects mismatched userId and adminId filters', async () => {
    await expect(
      provider.findAdminLogs({
        userId: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
        adminId: '0479e6b6-25a1-4d28-8ccf-a215c7de9c52',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects date ranges where dateFrom is after dateTo', async () => {
    await expect(
      provider.findAdminLogs({
        dateFrom: new Date('2026-07-30T00:00:00.000Z'),
        dateTo: new Date('2026-07-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('wraps unexpected Prisma failures', async () => {
    transactionMock.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(provider.findAdminLogs({})).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
