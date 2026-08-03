import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';

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

    void to;
    void resetUrl;
    void expiresInMinutes;

    this.logger.error(
      'Password reset SMTP delivery is not implemented yet. Configure a concrete mail transport before production use.',
    );
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
}
