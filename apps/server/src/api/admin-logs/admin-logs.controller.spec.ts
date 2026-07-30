import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { AdminLogsController } from './admin-logs.controller';
import { AdminLogsService } from './providers/admin-logs.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AdminLogsController', () => {
  const response = {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    },
  };

  let service: {
    findAdminLogs: jest.Mock<Promise<typeof response>, [unknown]>;
  };
  let controller: AdminLogsController;

  beforeEach(() => {
    service = {
      findAdminLogs: jest.fn().mockResolvedValue(response),
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

    expect(service.findAdminLogs).toHaveBeenCalledWith(query);
  });

  it('protects the endpoint with access-token and roles guards', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      AdminLogsController.prototype.findAdminLogs,
    );

    expect(guards).toEqual([AccessTokenGuard, RolesGuard]);
  });

  it('allows only SUPER_ADMIN users', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      AdminLogsController.prototype.findAdminLogs,
    );

    expect(roles).toEqual([UserRole.SUPER_ADMIN]);
  });

  it('is mounted at /admin-logs', () => {
    const path = Reflect.getMetadata(PATH_METADATA, AdminLogsController);

    expect(path).toBe('admin-logs');
  });
});
