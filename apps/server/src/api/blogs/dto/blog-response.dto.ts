import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, Language } from '@prisma/client';

export class BlogListItemResponseDto {
  @ApiProperty({ example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  id: string;

  @ApiProperty({ example: 'Fire safety checklist for commercial buildings' })
  title: string;

  @ApiProperty({ example: 'fire-safety-checklist' })
  slug: string;

  @ApiProperty({ example: 'A short overview of practical fire safety checks.' })
  excerpt: string;

  @ApiProperty({
    example: 'images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  coverImageKey: string;

  @ApiProperty({
    example:
      'https://my-bucket.fsn1.your-objectstorage.com/images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  coverImageUrl: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  language: Language;

  @ApiProperty({ enum: BlogStatus, example: BlogStatus.PUBLISHED })
  status: BlogStatus;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiPropertyOptional({ example: '2026-08-02T12:00:00.000Z', nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ example: '2026-08-02T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-02T12:00:00.000Z' })
  updatedAt: Date;
}

export class BlogResponseDto extends BlogListItemResponseDto {
  @ApiProperty({
    example: '<h2>Checklist</h2><p>Inspect alarms every month.</p>',
  })
  content: string;
}

export class BlogPaginationResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class BlogsResponseDto {
  @ApiProperty({ type: [BlogListItemResponseDto] })
  data: BlogListItemResponseDto[];

  @ApiProperty({ type: BlogPaginationResponseDto })
  pagination: BlogPaginationResponseDto;
}

export class DeleteBlogResponseDto {
  @ApiProperty({ type: BlogResponseDto })
  blog: BlogResponseDto;

  @ApiProperty({ example: 'Blog deleted successfully' })
  message: string;
}
