import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language, OutboundEmailStatus, UserRole } from '@prisma/client';

class OutboundEmailSenderDto {
  @ApiProperty({ example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  id: string;

  @ApiProperty({ example: 'admin@waveengineering.ge' })
  email: string;

  @ApiProperty({ example: 'Nino' })
  firstName: string;

  @ApiProperty({ example: 'Beridze' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;
}

export class SendOutboundEmailDataDto {
  @ApiProperty({ example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  id: string;

  @ApiProperty({ example: 'client@example.com' })
  recipientEmail: string;

  @ApiProperty({ example: 'Fire Protection System Proposal' })
  subject: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  language: Language;

  @ApiProperty({ enum: OutboundEmailStatus, example: OutboundEmailStatus.SENT })
  status: OutboundEmailStatus;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  sentAt: Date;
}

export class SendOutboundEmailResponseDto {
  @ApiProperty({ example: 'Email sent successfully.' })
  message: string;

  @ApiProperty({ type: SendOutboundEmailDataDto })
  data: SendOutboundEmailDataDto;
}

export class OutboundEmailListItemDto {
  @ApiProperty({ example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25' })
  id: string;

  @ApiProperty({ example: 'client@example.com' })
  recipientEmail: string;

  @ApiPropertyOptional({ example: 'Giorgi', nullable: true })
  recipientName: string | null;

  @ApiProperty({ example: 'Fire Protection System Proposal' })
  subject: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  language: Language;

  @ApiProperty({ enum: OutboundEmailStatus, example: OutboundEmailStatus.SENT })
  status: OutboundEmailStatus;

  @ApiPropertyOptional({ example: '2026-08-15T00:00:00.000Z', nullable: true })
  sentAt: Date | null;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: OutboundEmailSenderDto })
  createdBy: OutboundEmailSenderDto;
}

export class OutboundEmailDetailDto extends OutboundEmailListItemDto {
  @ApiPropertyOptional({
    example: 'Thank you for your interest',
    nullable: true,
  })
  heading: string | null;

  @ApiProperty({
    example: 'We have prepared additional information for you.',
  })
  message: string;

  @ApiPropertyOptional({ example: 'Visit our website', nullable: true })
  buttonText: string | null;

  @ApiPropertyOptional({
    example: 'https://waveengineering.ge/services',
    nullable: true,
  })
  buttonUrl: string | null;

  @ApiPropertyOptional({ example: 'abc-123', nullable: true })
  providerMessageId: string | null;

  @ApiPropertyOptional({ example: 'SMTP_DELIVERY_FAILED', nullable: true })
  failureCode: string | null;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z' })
  updatedAt: Date;
}

class OutboundEmailsMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class OutboundEmailsResponseDto {
  @ApiProperty({ type: [OutboundEmailListItemDto] })
  data: OutboundEmailListItemDto[];

  @ApiProperty({ type: OutboundEmailsMetaDto })
  meta: OutboundEmailsMetaDto;
}
