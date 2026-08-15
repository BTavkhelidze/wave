import { Language } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ServicesService } from './services.service';

describe('ServicesService analytics', () => {
  let prismaService: {
    service: {
      count: jest.Mock<Promise<number>, []>;
      aggregate: jest.Mock<
        Promise<{ _sum: { viewCount: number | null } }>,
        [unknown]
      >;
      findFirst: jest.Mock<Promise<unknown>, [unknown]>;
    };
    blog: {
      count: jest.Mock<Promise<number>, []>;
      aggregate: jest.Mock<
        Promise<{ _sum: { viewCount: number | null } }>,
        [unknown]
      >;
    };
  };
  let service: ServicesService;

  beforeEach(() => {
    prismaService = {
      service: {
        count: jest.fn<Promise<number>, []>().mockResolvedValue(2),
        aggregate: jest
          .fn<Promise<{ _sum: { viewCount: number | null } }>, [unknown]>()
          .mockResolvedValue({ _sum: { viewCount: 12 } }),
        findFirst: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
          id: 'service-id',
          viewCount: 8,
          translations: [{ title: 'Inspection' }],
        }),
      },
      blog: {
        count: jest.fn<Promise<number>, []>().mockResolvedValue(3),
        aggregate: jest
          .fn<Promise<{ _sum: { viewCount: number | null } }>, [unknown]>()
          .mockResolvedValue({ _sum: { viewCount: 21 } }),
      },
    };
    service = new ServicesService(prismaService as unknown as PrismaService);
  });

  it('returns database-backed service and blog totals', async () => {
    await expect(service.getAnalytics()).resolves.toEqual({
      services: {
        total: 2,
        totalViews: 12,
      },
      blogs: {
        total: 3,
        totalViews: 21,
      },
      totalServices: 2,
      totalServiceViews: 12,
      mostViewedService: {
        id: 'service-id',
        title: 'Inspection',
        viewCount: 8,
      },
    });

    expect(prismaService.service.count).toHaveBeenCalledTimes(1);
    expect(prismaService.service.aggregate).toHaveBeenCalledWith({
      _sum: {
        viewCount: true,
      },
    });
    expect(prismaService.blog.count).toHaveBeenCalledTimes(1);
    expect(prismaService.blog.aggregate).toHaveBeenCalledWith({
      _sum: {
        viewCount: true,
      },
    });
    expect(prismaService.service.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        select: expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          translations: expect.objectContaining({
            where: {
              language: Language.EN,
            },
          }),
        }),
      }),
    );
  });

  it('returns zero view totals for empty aggregate sums', async () => {
    prismaService.service.count.mockResolvedValue(0);
    prismaService.service.aggregate.mockResolvedValue({
      _sum: { viewCount: null },
    });
    prismaService.service.findFirst.mockResolvedValue(null);
    prismaService.blog.count.mockResolvedValue(0);
    prismaService.blog.aggregate.mockResolvedValue({
      _sum: { viewCount: null },
    });

    await expect(service.getAnalytics()).resolves.toMatchObject({
      services: {
        total: 0,
        totalViews: 0,
      },
      blogs: {
        total: 0,
        totalViews: 0,
      },
      totalServices: 0,
      totalServiceViews: 0,
      mostViewedService: null,
    });
  });
});
