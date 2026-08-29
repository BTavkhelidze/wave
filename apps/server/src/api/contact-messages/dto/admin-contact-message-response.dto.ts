import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';

export class AdminContactMessageDto {
  @ApiProperty({
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
  })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+995555123456', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({
    example: 'Fire protection system',
    nullable: true,
  })
  subject: string | null;

  @ApiProperty({
    example: 'I would like more information about this service.',
  })
  message: string;

  @ApiProperty({ enum: MessageStatus, example: MessageStatus.UNREAD })
  status: MessageStatus;

  @ApiPropertyOptional({ example: null, nullable: true })
  readAt: Date | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  archivedAt: Date | null;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  updatedAt: Date;
}

class ContactMessagesMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class AdminContactMessagesResponseDto {
  @ApiProperty({ type: [AdminContactMessageDto] })
  data: AdminContactMessageDto[];

  @ApiProperty({ type: ContactMessagesMetaDto })
  meta: ContactMessagesMetaDto;
}

export class ContactMessagesUnreadCountResponseDto {
  @ApiProperty({ example: 2 })
  count: number;
}
