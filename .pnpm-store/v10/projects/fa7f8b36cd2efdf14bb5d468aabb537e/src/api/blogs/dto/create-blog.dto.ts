import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, Language } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlogDto {
  @ApiProperty({ example: 'Fire safety checklist for commercial buildings' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'fire-safety-checklist' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'A short overview of practical fire safety checks.',
  })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty({
    example: '<h2>Checklist</h2><p>Inspect alarms every month.</p>',
    description: 'Sanitized TipTap HTML content.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  @IsString()
  @IsNotEmpty()
  coverImageKey: string;

  @ApiProperty({
    example:
      'https://my-bucket.fsn1.your-objectstorage.com/images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  @IsUrl({ require_tld: false })
  coverImageUrl: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ enum: BlogStatus, example: BlogStatus.DRAFT })
  @IsEnum(BlogStatus)
  status: BlogStatus;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: '2026-08-02T12:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;
}
