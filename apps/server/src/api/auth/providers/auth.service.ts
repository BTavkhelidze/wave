import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { SignInDto } from '../dtos/signIn.dto';

import { SignInProvider } from './signIn.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenProvider } from './refresh-tokens.provider';
import { ActiveUserProvider } from './active-user.provider';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    private readonly activeUserProvider: ActiveUserProvider,
  ) {}
  public async signIn(
    signInDto: SignInDto,
    res: Response<any, Record<string, any>>,
  ) {
    return this.signInProvider.signIn(signInDto, res);
  }

  public logout(res: Response<any, Record<string, any>>) {
    res.clearCookie('refreshToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });

    return {
      message: 'User logged out successfully',
    };
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshToken(refreshTokenDto);
  }

  public activeAccount(user: AuthenticatedUser): AuthenticatedUser {
    return this.activeUserProvider.activeAccount(user);
  }
}
