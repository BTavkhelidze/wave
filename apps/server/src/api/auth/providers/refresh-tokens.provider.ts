import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import jwtConfig from 'src/config/jwt.config';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { UsersService } from 'src/api/users/providers/users.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { HashProvider } from './hash.provider';
import { isValidSessionVersionClaim } from '../utils/session-version-claim.util';
import { setAuthCookies } from 'src/common/http/auth-cookie-options';

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
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      if (!this.isRefreshTokenPayload(payload)) {
        throw new UnauthorizedException();
      }

      const { sub, sessionVersion } = payload;
      const user = await this.userService.findUserById(sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      if (user.sessionVersion !== sessionVersion) {
        throw new UnauthorizedException();
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

      setAuthCookies(res, tokens, this.configService);

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

  private isRefreshTokenPayload(
    payload: unknown,
  ): payload is Pick<ActiveUserData, 'sub' | 'sessionVersion'> {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'sessionVersion' in payload &&
      typeof payload.sub === 'string' &&
      payload.sub.length > 0 &&
      isValidSessionVersionClaim(payload.sessionVersion)
    );
  }
}
