import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindOutboundEmailsQueryDto } from './dto/find-outbound-emails-query.dto';
import {
  OutboundEmailDetailDto,
  OutboundEmailsResponseDto,
  SendOutboundEmailResponseDto,
} from './dto/outbound-email-response.dto';
import { SendOutboundEmailDto } from './dto/send-outbound-email.dto';
import { OutboundEmailsService } from './outbound-emails.service';
import type { OutboundEmailDetail } from './providers/outbound-email-select.constant';
import type { FindOutboundEmailsResponse } from './providers/find-outbound-emails.provider';
import type { SendOutboundEmailResponse } from './providers/send-outbound-email.provider';

@ApiTags('admin-emails')
@ApiBearerAuth('access-token')
@Controller('admin/emails')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class OutboundEmailsController {
  constructor(private readonly outboundEmailsService: OutboundEmailsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a branded business email' })
  @ApiBody({ type: SendOutboundEmailDto })
  @ApiCreatedResponse({ type: SendOutboundEmailResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid outbound email payload.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can send business emails.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Email could not be delivered or stored.',
  })
  public send(
    @Body() sendOutboundEmailDto: SendOutboundEmailDto,
    @ActiveUser('id') adminId: string,
  ): Promise<SendOutboundEmailResponse> {
    return this.outboundEmailsService.send(sendOutboundEmailDto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Get outbound email history' })
  @ApiOkResponse({ type: OutboundEmailsResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can access email history.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Could not fetch outbound email history.',
  })
  public findMany(
    @Query() query: FindOutboundEmailsQueryDto,
  ): Promise<FindOutboundEmailsResponse> {
    return this.outboundEmailsService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get outbound email delivery detail' })
  @ApiParam({
    name: 'id',
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
  })
  @ApiOkResponse({ type: OutboundEmailDetailDto })
  @ApiBadRequestResponse({ description: 'Invalid outbound email ID.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can access email history.',
  })
  @ApiNotFoundResponse({ description: 'Outbound email not found.' })
  public findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OutboundEmailDetail> {
    return this.outboundEmailsService.findOne(id);
  }
}
