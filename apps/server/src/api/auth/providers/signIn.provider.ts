import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import { HashProvider } from './hash.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/api/users/providers/users.service';
import { GenerateTokenProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
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

    return await this.generateTokenProvider.generateTokens(user);
  }
}
