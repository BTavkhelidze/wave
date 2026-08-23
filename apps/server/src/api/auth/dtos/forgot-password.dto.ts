import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { normalizeEmailTransform } from './transformers';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'admin@example.com',
  })
  @Transform(normalizeEmailTransform)
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
