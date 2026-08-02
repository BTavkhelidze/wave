import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAction, AdminEntity, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminLogsResponseDto } from './dtos/admin-log-response.dto';
import {
  AdminLogSortOrder,
  FindAdminLogsQueryDto,
} from './dtos/find-admin-logs-query.dto';
import { AdminLogsService } from './providers/admin-logs.service';
import type { FindAdminLogsResponse } from './providers/find-admin-logs.provider';

@ApiTags('admin-logs')
@ApiBearerAuth('access-token')
@Controller('admin-logs')
export class AdminLogsController {
  constructor(private readonly adminLogsService: AdminLogsService) {}

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin action audit logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID of the admin/user who performed the action.',
  })
  @ApiQuery({
    name: 'adminId',
    required: false,
    description: 'Alias for userId.',
  })
  @ApiQuery({ name: 'action', required: false, enum: AdminAction })
  @ApiQuery({ name: 'entity', required: false, enum: AdminEntity })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    example: '2026-07-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    example: '2026-07-30T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'admin@example.com',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: AdminLogSortOrder,
    example: AdminLogSortOrder.DESC,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: AdminLogSortOrder,
    example: AdminLogSortOrder.DESC,
  })
  @ApiOkResponse({ type: AdminLogsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN users can access logs.',
  })
  public findAdminLogs(
    @Query() query: FindAdminLogsQueryDto,
  ): Promise<FindAdminLogsResponse> {
    return this.adminLogsService.findAdminLogs(query);
  }
}
