import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  AdminAction,
  AdminEntity,
  Language,
  OutboundEmailStatus,
  Prisma,
} from '@prisma/client';
import { MailDeliveryError, MailService } from 'src/api/mail/mail.service';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { SendOutboundEmailDto } from '../dto/send-outbound-email.dto';

export type SendOutboundEmailResponse = {
  message: string;
  data: {
    id: string;
    recipientEmail: string;
    language: Language;
    subject: string;
    status: OutboundEmailStatus;
    sentAt: Date;
  };
};

@Injectable()
export class SendOutboundEmailProvider {
  private readonly logger = new Logger(SendOutboundEmailProvider.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async send(
    dto: SendOutboundEmailDto,
    adminId: string,
  ): Promise<SendOutboundEmailResponse> {
    const normalizedDto = this.normalizeDto(dto);
    const outboundEmail = await this.createPendingEmail(normalizedDto, adminId);

    try {
      const delivery = await this.mailService.sendBusinessEmail({
        to: normalizedDto.recipientEmail,
        subject: normalizedDto.subject,
        recipientName: normalizedDto.recipientName,
        language: normalizedDto.language,
        heading: normalizedDto.heading,
        message: normalizedDto.message,
        buttonText: normalizedDto.buttonText,
        buttonUrl: normalizedDto.buttonUrl,
      });
      const sentAt = new Date();
      const sentEmail = await this.markSent({
        id: outboundEmail.id,
        providerMessageId: delivery.providerMessageId,
        sentAt,
        adminId,
      });

      return {
        message: 'Email sent successfully.',
        data: {
          id: sentEmail.id,
          recipientEmail: sentEmail.recipientEmail,
          language: sentEmail.language,
          subject: sentEmail.subject,
          status: sentEmail.status,
          sentAt: sentEmail.sentAt ?? sentAt,
        },
      };
    } catch (error: unknown) {
      const failureCode = this.sanitizeFailureCode(error);

      await this.markFailed(outboundEmail.id, failureCode);
      this.logger.error(
        `Outbound email ${outboundEmail.id} delivery failed with ${failureCode}.`,
      );

      throw new InternalServerErrorException(
        'Email could not be delivered. Please try again later.',
      );
    }
  }

  private async createPendingEmail(
    dto: NormalizedSendOutboundEmailDto,
    adminId: string,
  ): Promise<{ id: string }> {
    try {
      return await this.prismaService.outboundEmail.create({
        data: {
          recipientEmail: dto.recipientEmail,
          recipientName: dto.recipientName ?? null,
          language: dto.language,
          subject: dto.subject,
          heading: dto.heading ?? null,
          message: dto.message,
          buttonText: dto.buttonText ?? null,
          buttonUrl: dto.buttonUrl ?? null,
          status: OutboundEmailStatus.PENDING,
          providerMessageId: null,
          failureCode: null,
          sentAt: null,
          createdByUserId: adminId,
        },
        select: {
          id: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logPersistenceError('create pending outbound email', error);

      throw new InternalServerErrorException('Could not create outbound email');
    }
  }

  private async markSent({
    id,
    providerMessageId,
    sentAt,
    adminId,
  }: {
    id: string;
    providerMessageId?: string;
    sentAt: Date;
    adminId: string;
  }): Promise<{
    id: string;
    recipientEmail: string;
    language: Language;
    subject: string;
    status: OutboundEmailStatus;
    sentAt: Date | null;
  }> {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const outboundEmail = await tx.outboundEmail.update({
          where: {
            id,
          },
          data: {
            status: OutboundEmailStatus.SENT,
            providerMessageId: providerMessageId ?? null,
            failureCode: null,
            sentAt,
          },
          select: {
            id: true,
            recipientEmail: true,
            language: true,
            subject: true,
            status: true,
            sentAt: true,
          },
        });

        await tx.adminLog.create({
          data: {
            userId: adminId,
            action: AdminAction.CREATE,
            entity: AdminEntity.OUTBOUND_EMAIL,
            entityId: outboundEmail.id,
          },
        });

        return outboundEmail;
      });
    } catch (error: unknown) {
      this.logPersistenceError(`mark outbound email ${id} sent`, error);

      throw new InternalServerErrorException(
        'Email was sent but delivery history could not be updated',
      );
    }
  }

  private async markFailed(id: string, failureCode: string): Promise<void> {
    try {
      await this.prismaService.outboundEmail.update({
        where: {
          id,
        },
        data: {
          status: OutboundEmailStatus.FAILED,
          failureCode,
        },
        select: {
          id: true,
        },
      });
    } catch (error: unknown) {
      this.logPersistenceError(`mark outbound email ${id} failed`, error);
    }
  }

  private normalizeDto(
    dto: SendOutboundEmailDto,
  ): NormalizedSendOutboundEmailDto {
    return {
      recipientEmail: dto.recipientEmail,
      recipientName: this.normalizeOptionalText(dto.recipientName),
      language: dto.language,
      subject: this.normalizeHeaderText(dto.subject),
      heading: this.normalizeOptionalText(dto.heading),
      message: dto.message,
      buttonText: this.normalizeOptionalText(dto.buttonText),
      buttonUrl: this.normalizeOptionalText(dto.buttonUrl),
    };
  }

  private normalizeOptionalText(value: string | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }

  private normalizeHeaderText(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
  }

  private sanitizeFailureCode(error: unknown): string {
    if (error instanceof MailDeliveryError) {
      return error.deliveryCode;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
    ) {
      return this.normalizeFailureCode((error as { code: string }).code);
    }

    return error instanceof Error
      ? this.normalizeFailureCode(error.name)
      : 'UNKNOWN_ERROR';
  }

  private normalizeFailureCode(value: string): string {
    const normalizedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9_:-]/g, '_')
      .slice(0, 100);

    return normalizedValue || 'UNKNOWN_ERROR';
  }

  private logPersistenceError(action: string, error: unknown): void {
    const errorName =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : 'UnknownError';

    this.logger.error(`Outbound email ${action} failed: ${errorName}.`);
  }
}

type NormalizedSendOutboundEmailDto = {
  recipientEmail: string;
  recipientName?: string;
  language: Language;
  subject: string;
  heading?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
};
