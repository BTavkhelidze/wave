import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactMessagesService } from './contact-messages.service';
import {
  AdminContactMessageDto,
  AdminContactMessagesResponseDto,
  ContactMessagesUnreadCountResponseDto,
} from './dto/admin-contact-message-response.dto';
import { ContactMessageCreatedResponseDto } from './dto/contact-message-response.dto';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { FindContactMessagesQueryDto } from './dto/find-contact-messages-query.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';

@ApiTags('contact-messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a public contact form message' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiCreatedResponse({ type: ContactMessageCreatedResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid contact message payload.' })
  @ApiInternalServerErrorResponse({
    description: 'Could not process contact message.',
  })
  public create(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ): Promise<ContactMessageCreatedResponseDto> {
    return this.contactMessagesService.create(createContactMessageDto);
  }

  @Get('admin')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get contact messages for admin users' })
  @ApiOkResponse({ type: AdminContactMessagesResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin access is required.' })
  @ApiInternalServerErrorResponse({
    description: 'Could not fetch contact messages.',
  })
  public findAdmin(
    @Query() query: FindContactMessagesQueryDto,
  ): Promise<AdminContactMessagesResponseDto> {
    return this.contactMessagesService.findAdmin(query);
  }

  @Get('admin/unread-count')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get unread contact message count' })
  @ApiOkResponse({ type: ContactMessagesUnreadCountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin access is required.' })
  @ApiInternalServerErrorResponse({
    description: 'Could not fetch unread contact message count.',
  })
  public getUnreadCount(): Promise<ContactMessagesUnreadCountResponseDto> {
    return this.contactMessagesService.getUnreadCount();
  }

  @Get('admin/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get one contact message for admin users' })
  @ApiParam({
    name: 'id',
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
  })
  @ApiOkResponse({ type: AdminContactMessageDto })
  @ApiBadRequestResponse({ description: 'Invalid contact message ID.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({ description: 'Admin access is required.' })
  @ApiNotFoundResponse({ description: 'Contact message not found.' })
  public findAdminById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminContactMessageDto> {
    return this.contactMessagesService.findAdminById(id);
  }

  @Patch('admin/:id/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update contact message status' })
  @ApiParam({
    name: 'id',
    example: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
  })
  @ApiBody({ type: UpdateContactMessageStatusDto })
  @ApiOkResponse({ type: AdminContactMessageDto })
  @ApiBadRequestResponse({ description: 'Invalid contact message status.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'Only SUPER_ADMIN and ADMIN users can update message status.',
  })
  @ApiNotFoundResponse({ description: 'Contact message not found.' })
  public updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactMessageStatusDto: UpdateContactMessageStatusDto,
    @ActiveUser('id') adminId: string,
  ): Promise<AdminContactMessageDto> {
    return this.contactMessagesService.updateStatus(
      id,
      updateContactMessageStatusDto.status,
      adminId,
    );
  }
}
