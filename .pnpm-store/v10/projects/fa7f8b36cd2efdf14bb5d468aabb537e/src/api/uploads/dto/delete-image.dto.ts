import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    example: 'images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
    description: 'Object key returned by the upload endpoint.',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
