import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import jwtConfig from 'src/config/jwt.config';
import { GenerateTokenProvider } from './generate-tokens.provider';
import { UsersService } from 'src/api/users/providers/users.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly userService: UsersService,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  public async refreshToken(refreshTokenDTO: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDTO.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userService.findUserById(sub);
      return await this.generateTokenProvider.generateTokens(user);
    } catch (error) {
      throw new Error('Error generating refresh token: ' + error);
    }
  }
}
