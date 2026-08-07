import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PublicServiceResponse, ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceLanguage } from './enums/service-language';
import { FindServicesQueryDto } from './dto/find-services-query.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create service translation' })
  @ApiBody({ type: CreateServiceDto })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all services by language' })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: ServiceLanguage,
    example: ServiceLanguage.EN,
    description: 'Service language, for example EN or KA',
  })
  findAll(@Query() query: FindServicesQueryDto) {
    return this.servicesService.findAll(query.language);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public active services' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
          title_ka: 'Service title in Georgian',
          title_en: 'Service title in English',
          description_ka: 'Service description in Georgian',
          description_en: 'Service description in English',
          icon: 'FaTools',
          iconColor: '#3B82F6',
          colors: [],
        },
      ],
    },
  })
  findPublic(): Promise<PublicServiceResponse[]> {
    return this.servicesService.findPublic();
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment service view count' })
  @ApiParam({
    name: 'id',
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
    description: 'Service ID',
  })
  @ApiOkResponse({
    schema: {
      example: {
        viewCount: 15,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Service not found.' })
  incrementViewCount(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.incrementViewCount(id);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get one service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  @ApiBody({ type: UpdateServiceDto })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
