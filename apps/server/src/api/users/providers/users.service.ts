import { Injectable } from '@nestjs/common';
import { FindUserByIdEmailProvider } from './findUserByEmail.provider';
import { FindUserByIdProvider } from './findUserById.provider';

@Injectable()
export class UsersService {
  constructor(
    private findUserByIdEmailProvider: FindUserByIdEmailProvider,
    private findUserByIdProvider: FindUserByIdProvider,
  ) {}

  public findUserByEmail(email: string) {
    return this.findUserByIdEmailProvider.findUserByEmail(email);
  }

  public findUserById(id: string) {
    return this.findUserByIdProvider.findUserById(id);
  }

  public registerUser(email: string, password: string) {}
}
