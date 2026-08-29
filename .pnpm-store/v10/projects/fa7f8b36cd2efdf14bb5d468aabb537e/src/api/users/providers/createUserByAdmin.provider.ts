import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { HashProvider } from 'src/api/auth/providers/hash.provider';
import { CreateUserByAdminDto } from '../dtos/create-user-by-admin.dto';
import { generateTemporaryPassword } from 'src/common/utils/generate-temporary-password.util';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

export type CreateUserByAdminResponse = {
  user: SafeUser;
  temporaryPassword: string;
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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
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

      return {
        user,
        temporaryPassword,
      };
    } catch (error: unknown) {
      if (isPrismaKnownError(error) && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      throw new InternalServerErrorException('Could not create user');
    }
  }
}
