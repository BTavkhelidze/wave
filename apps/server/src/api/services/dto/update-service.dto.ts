import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { trimString } from './trim-string.transform';
import { DEFAULT_SERVICE_ANIMATION_COLORS } from '../lib/service-animation-colors.util';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    example: 'Fire and Life Safety',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    example:
      'Fire and life safety systems ensure protection during emergencies.',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: 'fire-and-life-safety',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Fire and Life Safety Services | Wave Engineering',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({
    example:
      'Professional fire and life safety services from Wave Engineering.',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({
    example: 'FaFireExtinguisher',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  icon?: string;

  @ApiPropertyOptional({
    example: '#EF4444',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  iconColor?: string;

  @ApiPropertyOptional({
    example: DEFAULT_SERVICE_ANIMATION_COLORS,
    type: [String],
    minItems: 5,
    maxItems: 5,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { each: true })
  animationColors?: string[];
}
