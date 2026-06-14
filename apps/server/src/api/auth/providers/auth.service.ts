import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signIn.dto';

import { SignInProvider } from './signIn.provider';

@Injectable()
export class AuthService {
  constructor(private readonly signInProvider: SignInProvider) {}
  public async signIn(signInDto: SignInDto) {
    return this.signInProvider.signIn(signInDto);
  }

  public async logout() {}
}
