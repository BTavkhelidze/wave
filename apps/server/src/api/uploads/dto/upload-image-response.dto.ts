import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example: 'images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  key: string;

  @ApiProperty({
    example:
      'https://my-bucket.fsn1.your-objectstorage.com/images/5d4e6f7a-73ef-4ad1-8202-4d8444f31820.webp',
  })
  url: string;
}
