import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { SignInDto } from '../dtos/signIn.dto';

import { SignInProvider } from './signIn.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenProvider } from './refresh-tokens.provider';
import { ActiveUserProvider } from './active-user.provider';
import { LogoutProvider } from './logout.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    private readonly activeUserProvider: ActiveUserProvider,
    private readonly logoutProvider: LogoutProvider,
  ) {}
  public async signIn(
    signInDto: SignInDto,
    res: Response<any, Record<string, any>>,
  ) {
    return this.signInProvider.signIn(signInDto, res);
  }

  public logout(res: Response<any, Record<string, any>>) {
    return this.logoutProvider.logout(res);
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshToken(refreshTokenDto);
  }

  public async activeAccount(userEmail: string) {
    return await this.activeUserProvider.activeAccount(userEmail);
  }
}
