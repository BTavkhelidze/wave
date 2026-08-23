import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import { buildBusinessEmailContent } from './templates/business-email.template';

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type ContactMessageMailInput = {
  name: string;
  email: string;
  message: string;
};

export type NewContactMessageNotificationInput = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  createdAt: Date;
};

export type TemporaryPasswordReason = 'USER_CREATED' | 'PASSWORD_RESET';

export type AdminTemporaryPasswordMailInput = {
  to: string;
  temporaryPassword: string;
  reason: TemporaryPasswordReason;
};

export type BusinessEmailMailInput = {
  to: string;
  subject: string;
  recipientName?: string;
  heading?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
};

export type BusinessEmailDeliveryResult = {
  providerMessageId?: string;
};

export class MailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly deliveryCode: string,
  ) {
    super(message);
    this.name = 'MailDeliveryError';
  }
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly emailService: MailerService,
  ) {}

  public async sendMail(input: SendMailInput): Promise<void> {
    await this.deliverMail(input);
  }

  public async sendBusinessEmail(
    input: BusinessEmailMailInput,
  ): Promise<BusinessEmailDeliveryResult> {
    const content = buildBusinessEmailContent({
      recipientName: input.recipientName,
      heading: input.heading,
      message: input.message,
      buttonText: input.buttonText,
      buttonUrl: input.buttonUrl,
      websiteUrl: this.appConfiguration.publicWebsiteUrl,
      logoUrl: this.appConfiguration.emailLogoUrl,
    });
    const result = await this.deliverMail({
      to: input.to,
      subject: this.normalizeHeaderText(input.subject),
      text: content.text,
      html: content.html,
      replyTo: this.getMailFrom(),
    });

    return {
      providerMessageId: this.extractMessageId(result),
    };
  }

  private async deliverMail(input: SendMailInput): Promise<unknown> {
    if (!this.isSmtpConfigured()) {
      this.logger.error('Email was not sent because SMTP is not configured.');
      throw new MailDeliveryError(
        'SMTP transport is not configured',
        'SMTP_NOT_CONFIGURED',
      );
    }

    try {
      return await this.emailService.sendMail({
        from: this.getMailFrom(),
        to: input.to,
        subject: this.normalizeHeaderText(input.subject),
        text: input.text,
        html: input.html,
        replyTo: input.replyTo,
      });
    } catch (error: unknown) {
      this.logMailDeliveryError(error);
      throw new MailDeliveryError(
        'Email delivery failed',
        this.resolveDeliveryCode(error),
      );
    }
  }

  public async sendAdminTemporaryPasswordEmail({
    to,
    temporaryPassword,
    reason,
  }: AdminTemporaryPasswordMailInput): Promise<void> {
    const loginUrl = new URL(
      '/login',
      this.appConfiguration.adminAppUrl,
    ).toString();
    const subject =
      reason === 'USER_CREATED'
        ? 'Your Wave Engineering admin account'
        : 'Your Wave Engineering password was reset';

    await this.sendMail({
      to,
      subject,
      text: this.buildAdminTemporaryPasswordText({
        email: to,
        temporaryPassword,
        loginUrl,
        reason,
      }),
      html: this.buildAdminTemporaryPasswordHtml({
        email: to,
        temporaryPassword,
        loginUrl,
        reason,
      }),
    });
  }

  public async sendContactMessage({
    name,
    email,
    message,
  }: ContactMessageMailInput): Promise<void> {
    const recipient = this.appConfiguration.mail.to;

    if (!recipient) {
      this.logger.error(
        'Contact notification email was not sent because MAIL_TO is not configured.',
      );
      throw new Error('Mail recipient is not configured');
    }

    await this.sendMail({
      to: recipient,
      replyTo: email,
      subject: `New contact message from ${this.normalizeHeaderText(name)}`,
      text: this.buildContactText({ name, email, message }),
      html: this.buildContactHtml({ name, email, message }),
    });
  }

  public async sendNewContactMessageNotification(
    contactMessage: NewContactMessageNotificationInput,
  ): Promise<void> {
    const recipient = this.appConfiguration.mail.contactNotificationEmail;

    if (!recipient) {
      this.logger.warn(
        'Contact notification email was not sent because CONTACT_NOTIFICATION_EMAIL is not configured.',
      );
      return;
    }

    const adminMessagesUrl = new URL(
      '/messages',
      this.appConfiguration.adminAppUrl,
    ).toString();

    await this.sendMail({
      to: recipient,
      replyTo: contactMessage.email,
      subject: 'New contact message received',
      text: this.buildNewContactMessageNotificationText({
        contactMessage,
        adminMessagesUrl,
      }),
      html: this.buildNewContactMessageNotificationHtml({
        contactMessage,
        adminMessagesUrl,
      }),
    });
  }

  private isSmtpConfigured(): boolean {
    const { mail } = this.appConfiguration;

    return (
      mail.provider === 'smtp' &&
      Boolean(
        mail.smtp.host &&
        mail.smtp.port &&
        mail.smtp.user &&
        mail.smtp.password,
      )
    );
  }

  private getMailFrom(): string {
    const configuredFrom = this.appConfiguration.mail.from?.trim();

    if (configuredFrom) {
      return this.normalizeHeaderText(configuredFrom);
    }

    const mailbox =
      this.appConfiguration.mail.smtp.user ?? 'info@waveengineering.ge';

    return this.normalizeHeaderText(`Wave Engineering <${mailbox}>`);
  }

  private buildAdminTemporaryPasswordText({
    email,
    temporaryPassword,
    loginUrl,
    reason,
  }: {
    email: string;
    temporaryPassword: string;
    loginUrl: string;
    reason: TemporaryPasswordReason;
  }): string {
    const intro =
      reason === 'USER_CREATED'
        ? 'Your Wave Engineering admin account has been created.'
        : 'A Wave Engineering administrator has reset your password.';

    return [
      'Wave Engineering',
      '',
      intro,
      '',
      `Admin panel: ${loginUrl}`,
      `Email: ${email}`,
      `One-time password: ${temporaryPassword}`,
      '',
      'Security notice: this password must be changed immediately after your first login.',
      'Do not share this password with anyone.',
      '',
      'If you did not expect this email, ignore it and contact your administrator.',
      '',
      'Wave Engineering',
    ].join('\n');
  }

  private buildAdminTemporaryPasswordHtml({
    email,
    temporaryPassword,
    loginUrl,
    reason,
  }: {
    email: string;
    temporaryPassword: string;
    loginUrl: string;
    reason: TemporaryPasswordReason;
  }): string {
    const safeEmail = this.escapeHtml(email);
    const safeTemporaryPassword = this.escapeHtml(temporaryPassword);
    const safeLoginUrl = this.escapeHtml(loginUrl);
    const intro =
      reason === 'USER_CREATED'
        ? 'Your Wave Engineering admin account has been created.'
        : 'A Wave Engineering administrator has reset your password.';

    return `
      <div style="margin:0;padding:0;background:#F8FAFC;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
          <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:24px;">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827;">Wave Engineering</h1>
            <p style="margin:0 0 20px;font-size:15px;">${intro}</p>
            <p style="margin:0 0 22px;">
              <a href="${safeLoginUrl}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#111827;color:#FFFFFF;text-decoration:none;font-weight:700;">Open admin panel</a>
            </p>
            <div style="margin:0 0 20px;padding:16px;border:1px solid #E5E7EB;border-radius:8px;background:#F9FAFB;">
              <p style="margin:0 0 8px;"><strong>Admin panel:</strong> <a href="${safeLoginUrl}" style="color:#2563EB;">${safeLoginUrl}</a></p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
              <p style="margin:0;"><strong>One-time password:</strong> <span style="font-family:Consolas,Monaco,monospace;">${safeTemporaryPassword}</span></p>
            </div>
            <p style="margin:0 0 12px;color:#92400E;"><strong>Security notice:</strong> this password must be changed immediately after your first login.</p>
            <p style="margin:0 0 16px;">Do not share this password with anyone.</p>
            <p style="margin:0;color:#6B7280;">If you did not expect this email, ignore it and contact your administrator.</p>
          </div>
        </div>
      </div>
    `;
  }

  private buildContactText({
    name,
    email,
    message,
  }: ContactMessageMailInput): string {
    return [
      'New contact message from Wave Engineering website',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n');
  }

  private buildContactHtml({
    name,
    email,
    message,
  }: ContactMessageMailInput): string {
    return `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${this.escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${this.escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;
  }

  private buildNewContactMessageNotificationText({
    contactMessage,
    adminMessagesUrl,
  }: {
    contactMessage: NewContactMessageNotificationInput;
    adminMessagesUrl: string;
  }): string {
    return [
      'New contact message received',
      '',
      `Full name: ${contactMessage.fullName}`,
      `Email: ${contactMessage.email}`,
      contactMessage.phone ? `Phone: ${contactMessage.phone}` : undefined,
      contactMessage.subject ? `Subject: ${contactMessage.subject}` : undefined,
      `Received: ${contactMessage.createdAt.toISOString()}`,
      '',
      'Message:',
      contactMessage.message,
      '',
      `Open messages: ${adminMessagesUrl}`,
    ]
      .filter((line): line is string => line !== undefined)
      .join('\n');
  }

  private buildNewContactMessageNotificationHtml({
    contactMessage,
    adminMessagesUrl,
  }: {
    contactMessage: NewContactMessageNotificationInput;
    adminMessagesUrl: string;
  }): string {
    const safeAdminMessagesUrl = this.escapeHtml(adminMessagesUrl);
    const safeFullName = this.escapeHtml(contactMessage.fullName);
    const safeEmail = this.escapeHtml(contactMessage.email);
    const safePhone = contactMessage.phone
      ? this.escapeHtml(contactMessage.phone)
      : undefined;
    const safeSubject = contactMessage.subject
      ? this.escapeHtml(contactMessage.subject)
      : undefined;
    const safeMessage = this.escapeHtml(contactMessage.message).replace(
      /\n/g,
      '<br>',
    );
    const safeReceivedAt = this.escapeHtml(
      contactMessage.createdAt.toISOString(),
    );

    return `
      <div style="margin:0;padding:0;background:#F8FAFC;">
        <div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6;">
          <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:24px;">
            <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827;">New contact message received</h1>
            <div style="margin:0 0 20px;padding:16px;border:1px solid #E5E7EB;border-radius:8px;background:#F9FAFB;">
              <p style="margin:0 0 8px;"><strong>Full name:</strong> ${safeFullName}</p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
              ${safePhone ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${safePhone}</p>` : ''}
              ${safeSubject ? `<p style="margin:0 0 8px;"><strong>Subject:</strong> ${safeSubject}</p>` : ''}
              <p style="margin:0;"><strong>Received:</strong> ${safeReceivedAt}</p>
            </div>
            <p style="margin:0 0 8px;"><strong>Message:</strong></p>
            <p style="margin:0 0 22px;padding:16px;border:1px solid #E5E7EB;border-radius:8px;background:#FFFFFF;">${safeMessage}</p>
            <p style="margin:0;">
              <a href="${safeAdminMessagesUrl}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#111827;color:#FFFFFF;text-decoration:none;font-weight:700;">Open messages</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private normalizeHeaderText(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
  }

  private extractMessageId(result: unknown): string | undefined {
    if (
      typeof result === 'object' &&
      result !== null &&
      'messageId' in result &&
      typeof (result as { messageId?: unknown }).messageId === 'string'
    ) {
      return (result as { messageId: string }).messageId;
    }

    return undefined;
  }

  private resolveDeliveryCode(error: unknown): string {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;
    const responseCode =
      typeof error === 'object' &&
      error !== null &&
      'responseCode' in error &&
      typeof (error as { responseCode?: unknown }).responseCode === 'number'
        ? `SMTP_${(error as { responseCode: number }).responseCode}`
        : undefined;
    const errorName = error instanceof Error ? error.name : undefined;

    return this.normalizeDeliveryCode(
      errorCode ?? responseCode ?? errorName ?? 'SMTP_DELIVERY_FAILED',
    );
  }

  private normalizeDeliveryCode(value: string): string {
    const normalizedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9_:-]/g, '_')
      .slice(0, 100);

    return normalizedValue || 'SMTP_DELIVERY_FAILED';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private logMailDeliveryError(error: unknown): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;
    const responseCode =
      typeof error === 'object' &&
      error !== null &&
      'responseCode' in error &&
      typeof (error as { responseCode?: unknown }).responseCode === 'number'
        ? (error as { responseCode: number }).responseCode
        : undefined;
    const command =
      typeof error === 'object' &&
      error !== null &&
      'command' in error &&
      typeof (error as { command?: unknown }).command === 'string'
        ? (error as { command: string }).command
        : undefined;

    const details = [errorCode, responseCode, command]
      .filter((value) => value !== undefined)
      .join(', ');

    this.logger.error(
      details
        ? `Email delivery failed with ${errorName} (${details}).`
        : `Email delivery failed with ${errorName}.`,
    );
  }
}
