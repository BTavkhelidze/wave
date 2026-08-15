import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ContactService,
  type CreateContactMessageResponse,
} from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a website contact message' })
  @ApiCreatedResponse({
    schema: {
      example: {
        id: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
        message: 'Contact message received successfully',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid contact payload.' })
  @ApiInternalServerErrorResponse({
    description: 'Could not process contact message.',
  })
  public createContactMessage(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ): Promise<CreateContactMessageResponse> {
    return this.contactService.createContactMessage(createContactMessageDto);
  }
}
