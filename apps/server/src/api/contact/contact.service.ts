import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

export type CreateContactMessageResponse = {
  id: string;
  message: string;
};

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async createContactMessage(
    createContactMessageDto: CreateContactMessageDto,
  ): Promise<CreateContactMessageResponse> {
    const contactMessage = await this.persistContactMessage(
      createContactMessageDto,
    );

    try {
      await this.mailService.sendContactMessage({
        name: contactMessage.fullName,
        email: contactMessage.email,
        message: contactMessage.message,
      });
    } catch (error: unknown) {
      this.logNotificationFailure(contactMessage.id, error);
    }

    return {
      id: contactMessage.id,
      message: 'Contact message received successfully',
    };
  }

  private async persistContactMessage(
    createContactMessageDto: CreateContactMessageDto,
  ) {
    try {
      return await this.prismaService.contactMessage.create({
        data: {
          fullName: createContactMessageDto.name.trim(),
          email: createContactMessageDto.email.trim().toLowerCase(),
          message: createContactMessageDto.message.trim(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Contact message persistence failed.');

      throw new InternalServerErrorException(
        'Could not process contact message',
      );
    }
  }

  private logNotificationFailure(
    contactMessageId: string,
    error: unknown,
  ): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    this.logger.error(
      `Contact notification email failed for message ${contactMessageId} with ${errorName}.`,
    );
  }
}
