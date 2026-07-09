import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { SignInDto } from '../dtos/signIn.dto';

import { SignInProvider } from './signIn.provider';
import { RefreshTokenProvider } from './refresh-tokens.provider';
import { ActiveUserProvider } from './active-user.provider';
import { LogoutProvider } from './logout.provider';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import {
  ChangePasswordProvider,
  type ChangePasswordResponse,
} from './change-password.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    private readonly activeUserProvider: ActiveUserProvider,
    private readonly logoutProvider: LogoutProvider,
    private readonly changePasswordProvider: ChangePasswordProvider,
  ) {}
  public async signIn(
    signInDto: SignInDto,
    res: Response<any, Record<string, any>>,
  ) {
    return this.signInProvider.signIn(signInDto, res);
  }

  public logout(userId: string, res: Response<any, Record<string, any>>) {
    return this.logoutProvider.logout(userId, res);
  }

  public async refreshToken(
    refreshToken: string,
    res: Response<any, Record<string, any>>,
  ) {
    return await this.refreshTokenProvider.refreshToken(refreshToken, res);
  }

  public async activeAccount(userEmail: string) {
    return await this.activeUserProvider.activeAccount(userEmail);
  }

  public async changePassword(
    activeUserId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.changePasswordProvider.changePassword(
      activeUserId,
      changePasswordDto,
    );
  }
}
