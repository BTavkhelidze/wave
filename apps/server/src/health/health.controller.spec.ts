import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: {
    $queryRaw: jest.Mock<Promise<unknown>, [unknown]>;
  };

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue([
        {
          '?column?': 1,
        },
      ]),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('returns liveness without checking dependencies', () => {
    expect(controller.liveness()).toEqual({ status: 'ok' });
    expect(prismaService.$queryRaw).not.toHaveBeenCalled();
  });

  it('returns readiness when the database responds', async () => {
    await expect(controller.readiness()).resolves.toEqual({ status: 'ok' });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns a generic readiness failure when the database is unavailable', async () => {
    prismaService.$queryRaw.mockRejectedValueOnce(new Error('db password bad'));

    await expect(controller.readiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
