import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersService } from 'src/api/users/providers/users.service';

@Injectable()
export class ActiveUserProvider {
  constructor(private readonly userService: UsersService) {}

  public async activeAccount(
    userEmail: string,
  ): Promise<Omit<User, 'password' | 'hashedRefreshToken' | 'sessionVersion'>> {
    const user = await this.userService.findUserByEmail(userEmail);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      passwordChangedAt: user.passwordChangedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
