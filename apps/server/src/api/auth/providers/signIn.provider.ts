import type { Response } from 'express';

import { HashProvider } from './hash.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAction, AdminEntity } from '@prisma/client';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/api/users/providers/users.service';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { setAuthCookies } from 'src/common/http/auth-cookie-options';

@Injectable()
export class SignInProvider {
  constructor(
    private readonly userService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}
  public async signIn(
    signInDto: SignInDto,
    res: Response<any, Record<string, any>>,
  ) {
    const user = await this.userService.findUserByEmail(signInDto.email);

    if (!user)
      throw new UnauthorizedException('Email or password is incorrect');

    if (!user.password)
      throw new UnauthorizedException('Email or password is incorrect');

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await this.hashProvider.comparePassword(
      signInDto.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Email or password is incorrect');

    const tokens = await this.generateTokenProvider.generateTokens(user);
    const hashedRefreshToken = await this.hashProvider.hashPassword(
      tokens.refreshToken,
    );

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          hashedRefreshToken,
        },
      });

      await tx.adminLog.create({
        data: {
          userId: user.id,
          action: AdminAction.LOGIN,
          entity: AdminEntity.USER,
          entityId: user.id,
        },
      });
    });

    setAuthCookies(res, tokens, this.configService);

    return {
      status: 200,
      message: 'User signed in successfully',
    };
  }
}
