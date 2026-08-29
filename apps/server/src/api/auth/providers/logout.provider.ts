import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAction, AdminEntity } from '@prisma/client';
import type { Response } from 'express';
import { clearAuthCookies } from 'src/common/http/auth-cookie-options';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

@Injectable()
export class LogoutProvider {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async logout(userId: string, res: Response<any, Record<string, any>>) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            hashedRefreshToken: null,
          },
        });

        await tx.adminLog.create({
          data: {
            userId,
            action: AdminAction.LOGOUT,
            entity: AdminEntity.USER,
            entityId: userId,
          },
        });
      });

      clearAuthCookies(res, this.configService);

      return {
        message: 'User logged out successfully',
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Could not log out');
    }
  }
}
