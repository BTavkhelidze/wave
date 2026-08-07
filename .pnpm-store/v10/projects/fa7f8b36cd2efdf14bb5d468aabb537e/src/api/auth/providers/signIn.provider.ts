import type { CookieOptions, Response } from 'express';

import { HashProvider } from './hash.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAction, AdminEntity } from '@prisma/client';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/api/users/providers/users.service';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

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
    console.log('signInDto1', signInDto);
    const user = await this.userService.findUserByEmail(signInDto.email);
    console.log('user', user);
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

    const isProduction =
      this.configService.get<string>('appConfig.environment') === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    };

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return {
      status: 200,
      message: 'User signed in successfully',
    };
  }
}
