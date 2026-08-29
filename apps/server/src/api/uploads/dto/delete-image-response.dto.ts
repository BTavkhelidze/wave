import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Image deleted successfully' })
  message: string;
}
