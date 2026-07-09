import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, AdminEntity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { UpdateUserByAdminDto } from '../dtos/update-user-by-admin.dto';
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
export class UpdateUserByAdminProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async updateUserByAdmin(
    userId: string,
    updateUserByAdminDto: UpdateUserByAdminDto,
    superAdminId: string,
  ): Promise<SafeUser> {
    const data: Prisma.UserUpdateInput = {};

    if (updateUserByAdminDto.firstName !== undefined) {
      data.firstName = updateUserByAdminDto.firstName;
    }

    if (updateUserByAdminDto.lastName !== undefined) {
      data.lastName = updateUserByAdminDto.lastName;
    }

    if (updateUserByAdminDto.email !== undefined) {
      data.email = updateUserByAdminDto.email;
    }

    if (updateUserByAdminDto.role !== undefined) {
      data.role = updateUserByAdminDto.role;
    }

    if (!Object.keys(data).length) {
      throw new BadRequestException('No user fields provided for update');
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: {
            id: userId,
          },
          data,
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

      if (isPrismaKnownError(error) && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      if (isPrismaKnownError(error) && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException('Could not update user');
    }
  }
}
