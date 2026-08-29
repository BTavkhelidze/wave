import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { HashProvider } from 'src/api/auth/providers/hash.provider';
import { MailService } from 'src/api/mail/mail.service';
import { CreateUserByAdminDto } from '../dtos/create-user-by-admin.dto';
import { generateTemporaryPassword } from 'src/common/utils/generate-temporary-password.util';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

export type CreateUserByAdminResponse = {
  user: SafeUser;
  emailSent: boolean;
  message: string;
};

type PrismaKnownError = {
  code: string;
};

const isPrismaKnownError = (error: unknown): error is PrismaKnownError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
};

@Injectable()
export class CreateUserByAdminProvider {
  private readonly logger = new Logger(CreateUserByAdminProvider.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
    private readonly mailService: MailService,
  ) {}

  public async createUserByAdmin(
    createUserByAdminDto: CreateUserByAdminDto,
    superAdminId: string,
  ): Promise<CreateUserByAdminResponse> {
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword =
      await this.hashProvider.hashPassword(temporaryPassword);

    try {
      const user = await this.prismaService.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firstName: createUserByAdminDto.firstName,
            lastName: createUserByAdminDto.lastName,
            email: createUserByAdminDto.email,
            password: hashedPassword,
            role: createUserByAdminDto.role,
            isActive: true,
            mustChangePassword: true,
          },
          select: safeUserSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: superAdminId,
            action: AdminAction.CREATE,
            entity: AdminEntity.USER,
            entityId: createdUser.id,
          },
        });

        return createdUser;
      });

      let emailSent = false;

      try {
        await this.mailService.sendAdminTemporaryPasswordEmail({
          to: user.email,
          temporaryPassword,
          reason: 'USER_CREATED',
        });
        emailSent = true;
      } catch (error: unknown) {
        this.logEmailDeliveryFailure({
          operation: 'USER_CREATED',
          userId: user.id,
          recipient: user.email,
          error,
        });
      }

      return {
        user,
        emailSent,
        message: emailSent
          ? 'User created and temporary password email sent.'
          : 'User created, but the temporary password email could not be delivered.',
      };
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      throw new InternalServerErrorException('Could not create user');
    }
  }

  private logEmailDeliveryFailure({
    operation,
    userId,
    recipient,
    error,
  }: {
    operation: 'USER_CREATED';
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
