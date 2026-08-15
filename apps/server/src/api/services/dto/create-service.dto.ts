import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ServiceLanguage } from '../enums/service-language';
import { trimString } from './trim-string.transform';

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
