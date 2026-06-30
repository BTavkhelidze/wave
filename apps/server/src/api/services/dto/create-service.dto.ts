import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ServiceLanguage } from '../enums/service-language';

class ServiceTranslationDto {
  @ApiProperty({
    example: 'en',
  })
  @IsEnum(ServiceLanguage)
  language: ServiceLanguage;

  @ApiProperty({
    example: 'Fire and Life Safety',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Fire and life safety systems ensure protection during emergencies.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateServiceDto {
  @ApiProperty({
    example: 'FaFireExtinguisher',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: '#EF4444',
  })
  @IsString()
  @IsNotEmpty()
  iconColor: string;

  @ApiProperty({
    type: [ServiceTranslationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations: ServiceTranslationDto[];
}
