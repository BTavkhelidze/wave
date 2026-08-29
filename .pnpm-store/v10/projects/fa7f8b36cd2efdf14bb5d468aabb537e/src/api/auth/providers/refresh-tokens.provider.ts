import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';

import jwtConfig from 'src/config/jwt.config';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { UsersService } from 'src/api/users/providers/users.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { HashProvider } from './hash.provider';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly userService: UsersService,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly hashProvider: HashProvider,
    private readonly configService: ConfigService,
  ) {}

  public async refreshToken(
    refreshToken: string,
    res: Response<any, Record<string, any>>,
  ) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userService.findUserById(sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      if (!user.hashedRefreshToken) {
        throw new UnauthorizedException();
      }

      const isRefreshTokenValid = await this.hashProvider.comparePassword(
        refreshToken,
        user.hashedRefreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokenProvider.generateTokens(user);
      const hashedRefreshToken = await this.hashProvider.hashPassword(
        tokens.refreshToken,
      );

      await this.userService.updateUserRefreshToken(
        user.id,
        hashedRefreshToken,
      );

      const isProduction =
        this.configService.get<string>('appConfig.environment') ===
        'production';
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
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException();
    }
  }
}
