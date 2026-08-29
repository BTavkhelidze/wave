import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(PayloadTooLargeException)
export class UploadExceptionFilter implements ExceptionFilter {
  public catch(exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const badRequest = new BadRequestException(
      'Image file size must not exceed 5 MB',
    );

    response.status(badRequest.getStatus()).json(badRequest.getResponse());
  }
}
