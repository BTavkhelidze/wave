import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import appConfig from 'src/config/app.config';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { PasswordResetEmailService } from '../email/password-reset-email.service';
import { PasswordResetRateLimitProvider } from './password-reset-rate-limit.provider';
import { PasswordResetTokenProvider } from './password-reset-token.provider';

export type ForgotPasswordResponse = {
  message: string;
};

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'If an account with this email exists, password reset instructions have been sent.';

@Injectable()
export class ForgotPasswordProvider {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordResetTokenProvider: PasswordResetTokenProvider,
    private readonly passwordResetEmailService: PasswordResetEmailService,
    private readonly passwordResetRateLimitProvider: PasswordResetRateLimitProvider,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    requestIp?: string,
  ): Promise<ForgotPasswordResponse> {
    this.passwordResetRateLimitProvider.consume(
      this.buildRateLimitKey(forgotPasswordDto.email, requestIp),
    );

    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: {
            equals: forgotPasswordDto.email,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return this.buildGenericResponse();
      }

      const rawToken = this.passwordResetTokenProvider.generateRawToken();
      const tokenHash = this.passwordResetTokenProvider.hashToken(rawToken);
      const expiresAt = this.buildExpiresAt();

      await this.prismaService.$transaction(async (tx) => {
        await tx.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        });

        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });
      });

      await this.passwordResetEmailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl: this.buildResetUrl(rawToken),
        expiresInMinutes: this.appConfiguration.passwordReset.expiresInMinutes,
      });

      return this.buildGenericResponse();
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Could not process password reset request',
      );
    }
  }

  private buildRateLimitKey(email: string, requestIp?: string): string {
    return `${requestIp ?? 'unknown'}:${email}`;
  }

  private buildExpiresAt(): Date {
    return new Date(
      Date.now() +
        this.appConfiguration.passwordReset.expiresInMinutes * 60 * 1000,
    );
  }

  private buildResetUrl(rawToken: string): string {
    const resetUrl = new URL(
      '/reset-password',
      this.appConfiguration.frontendUrl,
    );
    resetUrl.searchParams.set('token', rawToken);

    return resetUrl.toString();
  }

  private buildGenericResponse(): ForgotPasswordResponse {
    return {
      message: FORGOT_PASSWORD_SUCCESS_MESSAGE,
    };
  }
}
