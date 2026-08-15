import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, UserRole } from '@prisma/client';
import { generateTemporaryPassword } from 'src/common/utils/generate-temporary-password.util';
import { MailService } from 'src/api/mail/mail.service';
import { HashProvider } from 'src/api/auth/providers/hash.provider';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

export type ResetUserPasswordByAdminResponse = {
  user: SafeUser;
  emailSent: boolean;
  message: string;
};

@Injectable()
export class ResetUserPasswordByAdminProvider {
  private readonly logger = new Logger(ResetUserPasswordByAdminProvider.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
    private readonly mailService: MailService,
  ) {}

  public async resetUserPasswordByAdmin(
    userId: string,
    superAdminId: string,
  ): Promise<ResetUserPasswordByAdminResponse> {
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword =
      await this.hashProvider.hashPassword(temporaryPassword);

    try {
      const user = await this.prismaService.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });

        if (!existingUser) {
          throw new NotFoundException('User not found');
        }

        if (existingUser.role === UserRole.SUPER_ADMIN) {
          throw new ForbiddenException(
            'Super admin passwords cannot be reset through this endpoint',
          );
        }

        await tx.passwordResetToken.updateMany({
          where: {
            userId: existingUser.id,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        });

        const updatedUser = await tx.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            password: hashedPassword,
            mustChangePassword: true,
            passwordChangedAt: new Date(),
            hashedRefreshToken: null,
          },
          select: safeUserSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: superAdminId,
            action: AdminAction.PASSWORD_CHANGE,
            entity: AdminEntity.USER,
            entityId: updatedUser.id,
          },
        });

        return updatedUser;
      });

      let emailSent = false;

      try {
        await this.mailService.sendAdminTemporaryPasswordEmail({
          to: user.email,
          temporaryPassword,
          reason: 'PASSWORD_RESET',
        });
        emailSent = true;
      } catch (error: unknown) {
        this.logEmailDeliveryFailure({
          operation: 'PASSWORD_RESET',
          userId: user.id,
          recipient: user.email,
          error,
        });
      }

      return {
        user,
        emailSent,
        message: emailSent
          ? 'Password reset and temporary password email sent.'
          : 'Password reset, but the temporary password email could not be delivered.',
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not reset user password');
    }
  }

  private logEmailDeliveryFailure({
    operation,
    userId,
    recipient,
    error,
  }: {
    operation: 'PASSWORD_RESET';
    userId: string;
    recipient: string;
    error: unknown;
  }): void {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : undefined;

    this.logger.warn(
      `Temporary password email failed. operation=${operation} userId=${userId} recipient=${recipient} error=${errorName}${
        errorCode ? ` code=${errorCode}` : ''
      }`,
    );
  }
}
