import { ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ContactMessageSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindContactMessagesQueryDto {
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
    enum: MessageStatus,
    example: MessageStatus.UNREAD,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiPropertyOptional({ example: 'fire protection' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ContactMessageSortOrder,
    default: ContactMessageSortOrder.DESC,
    example: ContactMessageSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(ContactMessageSortOrder)
  sortOrder?: ContactMessageSortOrder = ContactMessageSortOrder.DESC;
}
