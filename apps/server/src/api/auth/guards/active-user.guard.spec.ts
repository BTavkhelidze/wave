import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ActiveUserGuard } from './active-user.guard';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';

type AuthenticatedRequest = Partial<Request> & {
  user?: ActiveUserData | Record<string, unknown>;
};

function createContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('ActiveUserGuard session version validation', () => {
  let prismaService: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let guard: ActiveUserGuard;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          isActive: true,
          sessionVersion: 2,
        }),
      },
    };
    guard = new ActiveUserGuard(prismaService as unknown as PrismaService);
  });

  it('accepts an access token payload with the current session version', async () => {
    await expect(
      guard.canActivate(
        createContext({
          user: {
            sub: 'user-id',
            email: 'admin@example.com',
            sessionVersion: 2,
          },
        } as AuthenticatedRequest),
      ),
    ).resolves.toBe(true);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
      select: {
        isActive: true,
        sessionVersion: true,
      },
    });
  });

  it('rejects an access token payload with an old session version', async () => {
    await expect(
      guard.canActivate(
        createContext({
          user: {
            sub: 'user-id',
            email: 'admin@example.com',
            sessionVersion: 1,
          },
        } as AuthenticatedRequest),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a pre-deployment access token payload without sessionVersion', async () => {
    await expect(
      guard.canActivate(
        createContext({
          user: {
            sub: 'user-id',
            email: 'admin@example.com',
          },
        } as AuthenticatedRequest),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a malformed access token sessionVersion claim', async () => {
    await expect(
      guard.canActivate(
        createContext({
          user: {
            sub: 'user-id',
            email: 'admin@example.com',
            sessionVersion: '2',
          },
        } as AuthenticatedRequest),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });
});
