import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, Language } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BlogSortBy, BlogSortOrder } from '../enums/blog-sort-by.enum';

function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
}

export class FindBlogsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'fire safety' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Language, example: Language.EN })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => optionalBoolean(value))
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    enum: BlogSortBy,
    default: BlogSortBy.CREATED_AT,
    example: BlogSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy?: BlogSortBy = BlogSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: BlogSortOrder,
    default: BlogSortOrder.DESC,
    example: BlogSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(BlogSortOrder)
  sortOrder?: BlogSortOrder = BlogSortOrder.DESC;
}
