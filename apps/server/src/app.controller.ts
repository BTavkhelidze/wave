import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './api/mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/send-email')
  async sendTestEmail(@Body() body: unknown): Promise<void> {
    // if (process.env.NODE_ENV === 'production') {
    //   throw new NotFoundException();
    // }
    console.log('Received test email request:', body);
    if (!this.isTestEmailBody(body)) {
      throw new BadRequestException('Invalid test email payload');
    }

    return this.mailService.sendTestEmail(body.to, body.subject, body.text);
  }

  private isTestEmailBody(
    body: unknown,
  ): body is { to: string; subject: string; text: string } {
    return (
      typeof body === 'object' &&
      body !== null &&
      'to' in body &&
      'subject' in body &&
      'text' in body &&
      typeof body.to === 'string' &&
      typeof body.subject === 'string' &&
      typeof body.text === 'string'
    );
  }
}
