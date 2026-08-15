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
import {
  ChangeInitialPasswordDto,
  ChangePasswordDto,
} from '../dtos/change-password.dto';

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

      this.assertUserHasPassword(user);

      const isCurrentPasswordValid = await this.hashProvider.comparePassword(
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

      await this.updatePassword(user.id, changePasswordDto.newPassword);

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

  public async changeInitialPassword(
    userId: string,
    changeInitialPasswordDto: ChangeInitialPasswordDto,
  ): Promise<ChangePasswordResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          password: true,
          mustChangePassword: true,
        },
      });

      this.assertUserHasPassword(user);

      if (!user.mustChangePassword) {
        throw new BadRequestException(
          'Initial password change is not required for this account',
        );
      }

      const isSamePassword = await this.hashProvider.comparePassword(
        changeInitialPasswordDto.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      await this.updatePassword(user.id, changeInitialPasswordDto.newPassword);

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

  private assertUserHasPassword<
    T extends { id: string; password: string | null },
  >(user: T | null): asserts user is T & { password: string } {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }
  }

  private async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await this.hashProvider.hashPassword(newPassword);

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
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
          userId,
          action: AdminAction.PASSWORD_CHANGE,
          entity: AdminEntity.USER,
          entityId: userId,
        },
      });
    });
  }
}
