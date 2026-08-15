import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimLowercaseString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeOptionalString = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
};

export class CreateContactMessageDto {
  @ApiProperty({
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'john@example.com',
    maxLength: 254,
  })
  @Transform(trimLowercaseString)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({
    example: '+995555123456',
    maxLength: 30,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Fire protection system',
    maxLength: 150,
  })
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @ApiProperty({
    example: 'I would like more information about this service.',
    minLength: 10,
    maxLength: 5000,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
