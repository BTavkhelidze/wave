import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAction, AdminEntity } from '@prisma/client';
import type { Response } from 'express';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { HashProvider } from './hash.provider';
import {
  ChangeInitialPasswordDto,
  ChangePasswordDto,
} from '../dtos/change-password.dto';
import { GenerateTokenProvider } from './generate-tokens.provider';
import {
  clearAuthCookies,
  setAuthCookies,
} from 'src/common/http/auth-cookie-options';

export type ChangePasswordResponse = {
  message: string;
};

type UpdatedPasswordUser = {
  id: string;
  email: string;
  sessionVersion: number;
};

@Injectable()
export class ChangePasswordProvider {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly configService: ConfigService,
  ) {}

  public async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    res: Response<any, Record<string, any>>,
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

      await this.updatePasswordAndIssueReplacementSession(
        user.id,
        changePasswordDto.newPassword,
        res,
      );

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
    res: Response<any, Record<string, any>>,
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

      await this.updatePasswordAndIssueReplacementSession(
        user.id,
        changeInitialPasswordDto.newPassword,
        res,
      );

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

  private async updatePasswordAndIssueReplacementSession(
    userId: string,
    newPassword: string,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const hashedPassword = await this.hashProvider.hashPassword(newPassword);

    const updatedUser = await this.prismaService.$transaction(async (tx) => {
      const passwordUser = await this.updatePasswordInTransaction(
        tx,
        userId,
        hashedPassword,
      );
      await this.createPasswordChangeLog(tx, passwordUser.id);

      return passwordUser;
    });

    try {
      const replacementTokens =
        await this.generateTokenProvider.generateTokens(updatedUser);
      const hashedRefreshToken = await this.hashProvider.hashPassword(
        replacementTokens.refreshToken,
      );

      const persistedRefreshToken = await this.prismaService.user.updateMany({
        where: {
          id: updatedUser.id,
          sessionVersion: updatedUser.sessionVersion,
        },
        data: {
          hashedRefreshToken,
        },
      });

      if (persistedRefreshToken.count !== 1) {
        throw new UnauthorizedException('Please sign in again');
      }

      this.setAuthCookies(res, replacementTokens);
    } catch {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Please sign in again');
    }
  }

  private async updatePasswordInTransaction(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    userId: string,
    hashedPassword: string,
  ): Promise<UpdatedPasswordUser> {
    return tx.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        hashedRefreshToken: null,
        sessionVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        email: true,
        sessionVersion: true,
      },
    });
  }

  private async createPasswordChangeLog(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    userId: string,
  ): Promise<void> {
    await tx.adminLog.create({
      data: {
        userId,
        action: AdminAction.PASSWORD_CHANGE,
        entity: AdminEntity.USER,
        entityId: userId,
      },
    });
  }

  private setAuthCookies(
    res: Response<any, Record<string, any>>,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    setAuthCookies(res, tokens, this.configService);
  }

  private clearAuthCookies(res: Response<any, Record<string, any>>): void {
    clearAuthCookies(res, this.configService);
  }
}
