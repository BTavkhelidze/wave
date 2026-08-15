import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateContactMessageStatusDto {
  @ApiProperty({
    enum: MessageStatus,
    example: MessageStatus.READ,
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}
