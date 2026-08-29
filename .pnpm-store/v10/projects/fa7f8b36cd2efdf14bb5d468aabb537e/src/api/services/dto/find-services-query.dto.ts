import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ServiceLanguage } from '../enums/service-language';

export class FindServicesQueryDto {
  @ApiPropertyOptional({
    enum: ServiceLanguage,
    example: ServiceLanguage.EN,
    description: 'Optional service translation language.',
  })
  @IsOptional()
  @IsEnum(ServiceLanguage)
  language?: ServiceLanguage;
}
