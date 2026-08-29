import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderServicesDto {
  @ApiProperty({
    type: [String],
    example: [
      'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
      'b2fc4fb4-d454-454a-8d19-bf8f1e4213b8',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  serviceIds: string[];
}
