import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class SendOutboundEmailDto {
  @ApiProperty({ example: 'client@example.com', maxLength: 254 })
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  recipientEmail: string;

  @ApiPropertyOptional({ example: 'Giorgi', maxLength: 100 })
  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({
    example: 'Fire Protection System Proposal',
    minLength: 2,
    maxLength: 150,
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  subject: string;

  @ApiPropertyOptional({
    example: 'Thank you for your interest',
    maxLength: 150,
  })
  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(150)
  heading?: string;

  @ApiProperty({
    example: 'We have prepared additional information for you.',
    minLength: 2,
    maxLength: 10000,
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10000)
  message: string;

  @ApiPropertyOptional({ example: 'Visit our website', maxLength: 60 })
  @Transform(({ value }) => trimOptionalString(value))
  @ValidateIf(
    (dto: SendOutboundEmailDto, value: unknown) =>
      value !== undefined || dto.buttonUrl !== undefined,
  )
  @IsDefined({ message: 'buttonText is required when buttonUrl is provided.' })
  @IsString()
  @MaxLength(60)
  buttonText?: string;

  @ApiPropertyOptional({
    example: 'https://waveengineering.ge/services',
    description: 'Absolute HTTP or HTTPS URL.',
  })
  @Transform(({ value }) => trimOptionalString(value))
  @ValidateIf(
    (dto: SendOutboundEmailDto, value: unknown) =>
      value !== undefined || dto.buttonText !== undefined,
  )
  @IsDefined({ message: 'buttonUrl is required when buttonText is provided.' })
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })
  @MaxLength(2048)
  buttonUrl?: string;
}
