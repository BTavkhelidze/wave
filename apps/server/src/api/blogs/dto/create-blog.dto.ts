import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, Language } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class CreateBlogTranslationDto {
  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ example: 'Fire safety checklist for commercial buildings' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ example: 'fire-safety-checklist' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug must use lowercase letters, numbers, and single hyphens only',
  })
  slug: string;

  @ApiProperty({
    example: 'A short overview of practical fire safety checks.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({
    example: '<h2>Checklist</h2><p>Inspect alarms every month.</p>',
    description: 'Sanitized TipTap HTML content.',
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

export class CreateBlogDto {
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

  @ApiProperty({ type: [CreateBlogTranslationDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateBlogTranslationDto)
  translations: CreateBlogTranslationDto[];
}
