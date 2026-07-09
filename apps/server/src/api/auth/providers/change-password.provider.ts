import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminAction, AdminEntity } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { HashProvider } from './hash.provider';
import { ChangePasswordDto } from '../dtos/change-password.dto';

export type ChangePasswordResponse = {
  message: string;
};

@Injectable()
export class ChangePasswordProvider {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
  ) {}

  public async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isCurrentPasswordValid =
        await this.hashProvider.comparePassword(
          changePasswordDto.currentPassword,
          user.password,
        );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const isSamePassword = await this.hashProvider.comparePassword(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      const hashedPassword = await this.hashProvider.hashPassword(
        changePasswordDto.newPassword,
      );

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
            mustChangePassword: false,
            passwordChangedAt: new Date(),
            hashedRefreshToken: null,
          },
        });

        await tx.adminLog.create({
          data: {
            userId: user.id,
            action: AdminAction.PASSWORD_CHANGE,
            entity: AdminEntity.USER,
            entityId: user.id,
          },
        });
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not change password');
    }
  }
}
