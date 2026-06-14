import { ApiProperty } from '@nestjs/swagger';
import { ServiceLanguage } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Fire and Life Safety',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Fire and life safety systems ensure protection during emergencies.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'en',
    description: 'Language code, for example en or ka',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(ServiceLanguage)
  language: ServiceLanguage;

  @ApiProperty({
    example: 'FaFireExtinguisher',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    example: 'red',
  })
  @IsString()
  @IsNotEmpty()
  iconColor: string;
}