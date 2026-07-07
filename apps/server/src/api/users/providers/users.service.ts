import { Injectable } from '@nestjs/common';
import { FindUserByIdEmailProvider } from './findUserByEmail.provider';
import { FindUserByIdProvider } from './findUserById.provider';
import { UpdateUserRefreshTokenProvider } from './updateUserRefreshToken.provider';

@Injectable()
export class UsersService {
  constructor(
    private findUserByIdEmailProvider: FindUserByIdEmailProvider,
    private findUserByIdProvider: FindUserByIdProvider,
    private updateUserRefreshTokenProvider: UpdateUserRefreshTokenProvider,
  ) {}

  public findUserByEmail(email: string) {
    return this.findUserByIdEmailProvider.findUserByEmail(email);
  }

  public findUserById(id: string) {
    return this.findUserByIdProvider.findUserById(id);
  }

  public async updateUserRefreshToken(userId: string, refreshToken: string) {
    return this.updateUserRefreshTokenProvider.updateUserRefreshToken(
      userId,
      refreshToken,
    );
  }

  public registerUser(email: string, password: string) {}
}
