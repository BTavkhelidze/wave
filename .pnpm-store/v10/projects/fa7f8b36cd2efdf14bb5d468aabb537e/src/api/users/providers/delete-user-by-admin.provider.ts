import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  safeUserSelect,
  type SafeUser,
} from '../constants/safe-user-select.constant';

@Injectable()
export class DeleteUserByAdminProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async deleteUserByAdmin(
    userId: string,
    superAdminId: string,
  ): Promise<SafeUser> {
    if (userId === superAdminId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

        if (!existingUser) {
          throw new NotFoundException('User not found');
        }

        const deletedUser = await tx.user.delete({
          where: {
            id: userId,
          },
          select: safeUserSelect,
        });

        await tx.adminLog.create({
          data: {
            userId: superAdminId,
            action: AdminAction.DELETE,
            entity: AdminEntity.USER,
            entityId: deletedUser.id,
          },
        });

        return deletedUser;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not delete user');
    }
  }
}
