import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { SignInDto } from '../dtos/signIn.dto';

import { SignInProvider } from './signIn.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenProvider } from './refresh-tokens.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokenProvider,
  ) {}
  public async signIn(
    signInDto: SignInDto,
    res: Response<any, Record<string, any>>,
  ) {
    return this.signInProvider.signIn(signInDto, res);
  }

  public async logout() {}

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshToken(refreshTokenDto);
  }

  public async authenticateUser(email: string, password: string) {}
}
