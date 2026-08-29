import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';

class ContactMessageCreatedDataDto {
  @ApiProperty({
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
  })
  id: string;

  @ApiProperty({
    enum: MessageStatus,
    example: MessageStatus.UNREAD,
  })
  status: MessageStatus;

  @ApiProperty({
    example: '2026-08-15T00:00:00.000Z',
  })
  createdAt: Date;
}

export class ContactMessageCreatedResponseDto {
  @ApiProperty({
    example: 'Your message has been received successfully.',
  })
  message: string;

  @ApiProperty({ type: ContactMessageCreatedDataDto })
  data: ContactMessageCreatedDataDto;
}
