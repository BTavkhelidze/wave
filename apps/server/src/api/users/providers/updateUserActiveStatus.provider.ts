import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

const isPrismaKnownError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError;
};

@Injectable()
export class UpdateUserActiveStatusProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async updateUserActiveStatus(
    userId: string,
    isActive: boolean,
    superAdminId: string,
  ): Promise<SafeUser> {
    if (!isActive && userId === superAdminId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            isActive,
            hashedRefreshToken: isActive ? undefined : null,
          },
          select: safeUserSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: superAdminId,
            action: AdminAction.UPDATE,
            entity: AdminEntity.USER,
            entityId: user.id,
          },
        });

        return user;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (isPrismaKnownError(error) && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException(
        'Could not update user active status',
      );
    }
  }
}
