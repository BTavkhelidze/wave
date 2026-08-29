import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { AdminLogsController } from './admin-logs.controller';
import { AdminLogsService } from './providers/admin-logs.service';
import type { FindAdminLogsResponse } from './providers/find-admin-logs.provider';
import type { FindAdminLogsQueryDto } from './dtos/find-admin-logs-query.dto';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

function getFindAdminLogsHandler(): object {
  const descriptor = Object.getOwnPropertyDescriptor(
    AdminLogsController.prototype,
    'findAdminLogs',
  );
  const handler: unknown = descriptor?.value;

  if (typeof handler !== 'function') {
    throw new Error('AdminLogsController.findAdminLogs handler not found');
  }

  return handler;
}

describe('AdminLogsController', () => {
  const response: FindAdminLogsResponse = {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    },
  };

  let findAdminLogsMock: jest.Mock<
    Promise<FindAdminLogsResponse>,
    [FindAdminLogsQueryDto]
  >;
  let service: jest.Mocked<Pick<AdminLogsService, 'findAdminLogs'>>;
  let controller: AdminLogsController;

  beforeEach(() => {
    findAdminLogsMock = jest
      .fn<Promise<FindAdminLogsResponse>, [FindAdminLogsQueryDto]>()
      .mockResolvedValue(response);
    service = {
      findAdminLogs: findAdminLogsMock,
    };
    controller = new AdminLogsController(
      service as unknown as AdminLogsService,
    );
  });

  it('delegates GET /admin-logs queries to the service', async () => {
    const query = {
      page: 2,
      limit: 5,
    };

    await expect(controller.findAdminLogs(query)).resolves.toEqual(response);

    expect(findAdminLogsMock).toHaveBeenCalledWith(query);
  });

  it('protects the endpoint with access-token and roles guards', () => {
    const guards: unknown = Reflect.getMetadata(
      GUARDS_METADATA,
      getFindAdminLogsHandler(),
    );

    expect(guards).toEqual([AccessTokenGuard, RolesGuard]);
  });

  it('allows only SUPER_ADMIN users', () => {
    const roles: unknown = Reflect.getMetadata(
      ROLES_KEY,
      getFindAdminLogsHandler(),
    );

    expect(roles).toEqual([UserRole.SUPER_ADMIN]);
  });

  it('is mounted at /admin-logs', () => {
    const path: unknown = Reflect.getMetadata(
      PATH_METADATA,
      AdminLogsController,
    );

    expect(path).toBe('admin-logs');
  });
});
