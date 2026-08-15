import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, Language } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class UpdateBlogTranslationDto {
  @ApiPropertyOptional({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiPropertyOptional({
    example: 'Fire safety checklist for commercial buildings',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'fire-safety-checklist' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must use lowercase letters, numbers, and single hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'A short overview of practical fire safety checks.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  excerpt: string;

  @ApiPropertyOptional({
    example: '<h2>Checklist</h2><p>Inspect alarms every month.</p>',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;

  @ApiPropertyOptional({
    example: 'Fire safety checklist | Wave',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'A concise search result summary for this blog.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;
}

export class UpdateBlogDto {
  @ApiPropertyOptional({
    example: 'Fire safety checklist for commercial buildings',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'fire-safety-checklist' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @ApiPropertyOptional({
    example: 'A short overview of practical fire safety checks.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  excerpt?: string;

  @ApiPropertyOptional({
    example: '<h2>Checklist</h2><p>Inspect alarms every month.</p>',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    example: 'images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  coverImageKey?: string;

  @ApiPropertyOptional({
    example:
      'https://my-bucket.fsn1.your-objectstorage.com/images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: Language, example: Language.EN })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: false })
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

  @ApiPropertyOptional({ type: [UpdateBlogTranslationDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateBlogTranslationDto)
  translations?: UpdateBlogTranslationDto[];
}
