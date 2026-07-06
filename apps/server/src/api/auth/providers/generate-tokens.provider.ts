import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { User } from '@prisma/client';

import jwtConfig from 'src/config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken<T extends Record<string, unknown>>(
    userId: string,
    expiresIn: string,
    payload?: T,
  ): Promise<string> {
    const signOptions: JwtSignOptions = {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn: expiresIn as StringValue,
    };

    return this.jwtService.signAsync(
      { sub: userId, ...(payload ?? {}) } as Record<string, unknown>,
      signOptions,
    );
  }

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenExpiresIn!,
        {
          email: user.email,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenExpiresIn!, {
        email: user.email,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
