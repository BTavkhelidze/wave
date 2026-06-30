import { JwtService } from '@nestjs/jwt';

import { HashProvider } from './hash.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/api/users/providers/users.service';

@Injectable()
export class SignInProvider {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashProvider: HashProvider,
  ) {}
  public async signIn(signInDto: SignInDto) {
    const user = await this.userService.findUserByEmail(signInDto.email);
    const res = await this.hashProvider.comparePassword(
      signInDto.password,
      user.password,
    );
    if (!res) throw new UnauthorizedException('Email or password is incorrect');

    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });
    return { token };
  }
}
