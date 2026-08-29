import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ServiceLanguage } from '../enums/service-language';
import { trimString } from './trim-string.transform';
import { DEFAULT_SERVICE_ANIMATION_COLORS } from '../lib/service-animation-colors.util';

class ServiceTranslationDto {
  @ApiProperty({
    enum: ServiceLanguage,
    example: ServiceLanguage.EN,
  })
  @IsEnum(ServiceLanguage)
  language: ServiceLanguage;

  @ApiProperty({
    example: 'Fire and Life Safety',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Fire and life safety systems ensure protection during emergencies.',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'fire-and-life-safety',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'Fire and Life Safety Services | Wave Engineering',
    required: false,
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example:
      'Professional fire and life safety services from Wave Engineering.',
    required: false,
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class CreateServiceDto {
  @ApiProperty({
    example: 'FaFireExtinguisher',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: '#EF4444',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  iconColor: string;

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

  @ApiProperty({
    type: [ServiceTranslationDto],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations: ServiceTranslationDto[];
}
