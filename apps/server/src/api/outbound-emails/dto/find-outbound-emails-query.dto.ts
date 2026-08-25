import { ApiPropertyOptional } from '@nestjs/swagger';
import { OutboundEmailStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum OutboundEmailSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindOutboundEmailsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: OutboundEmailStatus,
    example: OutboundEmailStatus.SENT,
  })
  @IsOptional()
  @IsEnum(OutboundEmailStatus)
  status?: OutboundEmailStatus;

  @ApiPropertyOptional({ example: 'proposal' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: OutboundEmailSortOrder,
    default: OutboundEmailSortOrder.DESC,
    example: OutboundEmailSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(OutboundEmailSortOrder)
  sortOrder?: OutboundEmailSortOrder = OutboundEmailSortOrder.DESC;
}
