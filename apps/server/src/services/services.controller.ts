import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create service translation' })
  @ApiBody({ type: CreateServiceDto })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services by language' })
  @ApiQuery({
    name: 'language',
    required: false,
    example: 'en',
    description: 'Service language, for example en or ka',
  })
  findAll(@Query('language') language = 'en') {
    return this.servicesService.findAll(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  @ApiBody({ type: UpdateServiceDto })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service translation by ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Service translation ID',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}