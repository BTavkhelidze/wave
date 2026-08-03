import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import type { Response } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { HashProvider } from './hash.provider';
import { PasswordResetTokenProvider } from './password-reset-token.provider';

export type ResetPasswordResponse = {
  message: string;
};

const INVALID_RESET_TOKEN_MESSAGE = 'Invalid or expired password reset token';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
    private readonly passwordResetTokenProvider: PasswordResetTokenProvider,
  ) {}

  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    res: Response<any, Record<string, any>>,
  ): Promise<ResetPasswordResponse> {
    try {
      const tokenHash = this.passwordResetTokenProvider.hashToken(
        resetPasswordDto.token,
      );
      const now = new Date();

      await this.prismaService.$transaction(async (tx) => {
        const passwordResetToken = await tx.passwordResetToken.findUnique({
          where: {
            tokenHash,
          },
          select: {
            id: true,
            userId: true,
            expiresAt: true,
            usedAt: true,
            user: {
              select: {
                isActive: true,
              },
            },
          },
        });

        if (
          !passwordResetToken ||
          passwordResetToken.usedAt ||
          passwordResetToken.expiresAt <= now ||
          !passwordResetToken.user.isActive
        ) {
          throw new BadRequestException(INVALID_RESET_TOKEN_MESSAGE);
        }

        const claimedToken = await tx.passwordResetToken.updateMany({
          where: {
            id: passwordResetToken.id,
            usedAt: null,
            expiresAt: {
              gt: now,
            },
          },
          data: {
            usedAt: now,
          },
        });

        if (claimedToken.count !== 1) {
          throw new BadRequestException(INVALID_RESET_TOKEN_MESSAGE);
        }

        const hashedPassword = await this.hashProvider.hashPassword(
          resetPasswordDto.newPassword,
        );

        await tx.user.update({
          where: {
            id: passwordResetToken.userId,
          },
          data: {
            password: hashedPassword,
            passwordChangedAt: now,
            mustChangePassword: false,
            hashedRefreshToken: null,
          },
        });

        await tx.passwordResetToken.updateMany({
          where: {
            userId: passwordResetToken.userId,
            usedAt: null,
          },
          data: {
            usedAt: now,
          },
        });

        await tx.adminLog.create({
          data: {
            userId: passwordResetToken.userId,
            action: AdminAction.PASSWORD_CHANGE,
            entity: AdminEntity.USER,
            entityId: passwordResetToken.userId,
          },
        });
      });

      res.clearCookie('refreshToken', { path: '/' });
      res.clearCookie('accessToken', { path: '/' });

      return {
        message:
          'Password has been reset successfully. Please sign in with your new password.',
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not reset password');
    }
  }
}
