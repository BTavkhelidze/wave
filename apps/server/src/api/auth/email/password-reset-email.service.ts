import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import { MailService } from 'src/api/mail/mail.service';

type PasswordResetEmail = {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
};

@Injectable()
export class PasswordResetEmailService {
  private readonly logger = new Logger(PasswordResetEmailService.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly mailService: MailService,
  ) {}

  public async sendPasswordResetEmail({
    to,
    resetUrl,
    expiresInMinutes,
  }: PasswordResetEmail): Promise<void> {
    const { mail } = this.appConfiguration;

    if (!mail.provider) {
      this.logger.error(
        'Password reset email was not sent because MAIL_PROVIDER is not configured.',
      );
      return;
    }

    if (mail.provider !== 'smtp') {
      this.logger.error(
        `Password reset email was not sent because MAIL_PROVIDER=${mail.provider} is not supported.`,
      );
      return;
    }

    if (!this.hasSmtpConfiguration()) {
      this.logger.error(
        'Password reset email was not sent because SMTP configuration is incomplete.',
      );
      return;
    }

    await this.mailService.sendMail({
      to,
      subject: 'Reset your Wave Engineering admin password',
      text: this.buildPasswordResetText(resetUrl, expiresInMinutes),
      html: this.buildPasswordResetHtml(resetUrl, expiresInMinutes),
    });
  }

  private hasSmtpConfiguration(): boolean {
    const { mail } = this.appConfiguration;

    return Boolean(
      mail.from &&
      mail.smtp.host &&
      mail.smtp.port &&
      mail.smtp.user &&
      mail.smtp.password,
    );
  }

  private buildPasswordResetText(
    resetUrl: string,
    expiresInMinutes: number,
  ): string {
    return [
      'A password reset was requested for your Wave Engineering admin account.',
      '',
      `Open this link to reset your password: ${resetUrl}`,
      '',
      `This link expires in ${expiresInMinutes} minutes.`,
      'If you did not request this, you can ignore this email.',
    ].join('\n');
  }

  private buildPasswordResetHtml(
    resetUrl: string,
    expiresInMinutes: number,
  ): string {
    return `
      <h2>Password reset requested</h2>
      <p>A password reset was requested for your Wave Engineering admin account.</p>
      <p><a href="${this.escapeHtml(resetUrl)}">Reset your password</a></p>
      <p>This link expires in ${expiresInMinutes} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
