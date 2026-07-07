import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class ActiveUserProvider {
  public activeAccount(user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
