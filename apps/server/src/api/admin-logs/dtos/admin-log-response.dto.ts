import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminAction, AdminEntity, UserRole } from '@prisma/client';

export class AdminLogUserResponseDto {
  @ApiProperty({
    example: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
  })
  id: string;

  @ApiProperty({
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.SUPER_ADMIN,
  })
  role: UserRole;
}

export class AdminLogResponseDto {
  @ApiProperty({
    example: '6dcdde8e-1c4f-4631-9077-28b7a71ebf6a',
  })
  id: string;

  @ApiPropertyOptional({
    example: '3f15e2f1-4b5e-4af2-a1d9-5d3e823e7b1b',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    enum: AdminAction,
    example: AdminAction.CREATE,
  })
  action: AdminAction;

  @ApiProperty({
    enum: AdminEntity,
    example: AdminEntity.USER,
  })
  entity: AdminEntity;

  @ApiPropertyOptional({
    example: '0479e6b6-25a1-4d28-8ccf-a215c7de9c52',
    nullable: true,
  })
  entityId: string | null;

  @ApiProperty({
    example: '2026-07-30T08:45:12.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    type: AdminLogUserResponseDto,
    nullable: true,
  })
  user: AdminLogUserResponseDto | null;
}

export class AdminLogsPaginationResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class AdminLogsResponseDto {
  @ApiProperty({
    type: [AdminLogResponseDto],
  })
  data: AdminLogResponseDto[];

  @ApiProperty({
    type: AdminLogsPaginationResponseDto,
  })
  pagination: AdminLogsPaginationResponseDto;
}
