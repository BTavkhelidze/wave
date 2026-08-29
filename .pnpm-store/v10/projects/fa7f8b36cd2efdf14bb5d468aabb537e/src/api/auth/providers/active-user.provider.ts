import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersService } from 'src/api/users/providers/users.service';

@Injectable()
export class ActiveUserProvider {
  constructor(private readonly userService: UsersService) {}

  public async activeAccount(
    userEmail: string,
  ): Promise<Omit<User, 'password' | 'hashedRefreshToken'>> {
    const user = await this.userService.findUserByEmail(userEmail);
    const {
      password: _password,
      hashedRefreshToken: _hashedRefreshToken,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }
}
