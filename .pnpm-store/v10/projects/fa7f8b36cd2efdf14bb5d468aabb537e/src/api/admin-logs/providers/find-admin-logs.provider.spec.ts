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
  const createdAt = new Date('2026-07-30T08:45:12.000Z');
  const log: AdminLogItem = {
    id: '6dcdde8e-1c4f-4631-9077-28b7a71ebf6a',
    userId: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
    action: AdminAction.CREATE,
    entity: AdminEntity.USER,
    entityId: '0479e6b6-25a1-4d28-8ccf-a215c7de9c52',
    createdAt,
    user: {
      id: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
    },
  };

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
    prismaService = {
      adminLog: {
        findMany: jest.fn().mockResolvedValue([log]),
        count: jest.fn().mockResolvedValue(21),
      },
      $transaction: jest
        .fn()
        .mockImplementation(
          async (operations) =>
            Promise.all(operations) as Promise<[AdminLogItem[], number]>,
        ),
    };
    provider = new FindAdminLogsProvider(
      prismaService as unknown as PrismaService,
    );
  });

  it('uses sensible pagination and newest-first defaults', async () => {
    const response = await provider.findAdminLogs({});

    expect(prismaService.adminLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: {
          createdAt: AdminLogSortOrder.DESC,
        },
        skip: 0,
        take: 10,
      }),
    );
    expect(prismaService.adminLog.count).toHaveBeenCalledWith({
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

    expect(prismaService.adminLog.findMany).toHaveBeenCalledWith(
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
      userId: log.userId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.USER,
      dateFrom,
      dateTo,
    });

    const expectedWhere: Prisma.AdminLogWhereInput = {
      userId: log.userId,
      action: AdminAction.UPDATE,
      entity: AdminEntity.USER,
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    };

    expect(prismaService.adminLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expectedWhere,
      }),
    );
    expect(prismaService.adminLog.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('supports the adminId alias for actor filtering', async () => {
    await provider.findAdminLogs({
      adminId: log.userId,
    });

    expect(prismaService.adminLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: log.userId,
        },
      }),
    );
  });

  it('supports text search across log ids, entity ids, actor ids, and email', async () => {
    await provider.findAdminLogs({
      search: ' admin@example.com ',
    });

    expect(prismaService.adminLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: expect.arrayContaining([
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
        },
      }),
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
    prismaService.$transaction.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    await expect(provider.findAdminLogs({})).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
