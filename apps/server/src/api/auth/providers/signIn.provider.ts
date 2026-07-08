import type { CookieOptions, Response } from 'express';

import { HashProvider } from './hash.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/api/users/providers/users.service';
import { GenerateTokenProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    private readonly userService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly configService: ConfigService,
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

    await this.userService.updateUserRefreshToken(user.id, hashedRefreshToken);

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
