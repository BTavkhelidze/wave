import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminAction, AdminEntity } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum AdminLogSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindAdminLogsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
    description: 'ID of the admin/user who performed the action.',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
    description: 'Alias for userId.',
  })
  @IsOptional()
  @IsUUID()
  adminId?: string;

  @ApiPropertyOptional({
    enum: AdminAction,
    example: AdminAction.CREATE,
  })
  @IsOptional()
  @IsEnum(AdminAction)
  action?: AdminAction;

  @ApiPropertyOptional({
    enum: AdminEntity,
    example: AdminEntity.USER,
  })
  @IsOptional()
  @IsEnum(AdminEntity)
  entity?: AdminEntity;

  @ApiPropertyOptional({
    example: '2026-07-01T00:00:00.000Z',
    description: 'Include logs created at or after this date.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @ApiPropertyOptional({
    example: '2026-07-30T23:59:59.999Z',
    description: 'Include logs created at or before this date.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  @ApiPropertyOptional({
    example: 'admin@example.com',
    description: 'Searches log IDs, actor IDs, entity IDs, and actor email.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: AdminLogSortOrder,
    default: AdminLogSortOrder.DESC,
    example: AdminLogSortOrder.DESC,
    description: 'Sort order for createdAt.',
  })
  @IsOptional()
  @IsEnum(AdminLogSortOrder)
  sort?: AdminLogSortOrder = AdminLogSortOrder.DESC;

  @ApiPropertyOptional({
    enum: AdminLogSortOrder,
    default: AdminLogSortOrder.DESC,
    example: AdminLogSortOrder.DESC,
    description: 'Alias for sort. Sort order for createdAt.',
  })
  @IsOptional()
  @IsEnum(AdminLogSortOrder)
  sortOrder?: AdminLogSortOrder;
}
