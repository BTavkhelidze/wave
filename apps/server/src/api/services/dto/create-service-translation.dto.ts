import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ServiceLanguage } from '../enums/service-language';
import { trimString } from './trim-string.transform';

export class CreateServiceTranslationDto {
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
}
