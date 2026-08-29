import { Injectable } from '@nestjs/common';
import { FindUserByIdEmailProvider } from './findUserByEmail.provider';
import { FindUserByIdProvider } from './findUserById.provider';
import { UpdateUserRefreshTokenProvider } from './updateUserRefreshToken.provider';
import { UpdateUserActiveStatusProvider } from './updateUserActiveStatus.provider';
import { CreateUserByAdminProvider } from './createUserByAdmin.provider';
import type { CreateUserByAdminResponse } from './createUserByAdmin.provider';
import { CreateUserByAdminDto } from '../dtos/create-user-by-admin.dto';
import { FindAllUsersProvider } from './find-all-users.provider';
import type { SafeUser } from '../constants/safe-user-select.constant';
import { FindUserByIdForAdminProvider } from './find-user-by-id-for-admin.provider';
import { UpdateUserByAdminProvider } from './update-user-by-admin.provider';
import { UpdateUserByAdminDto } from '../dtos/update-user-by-admin.dto';
import { DeleteUserByAdminProvider } from './delete-user-by-admin.provider';

@Injectable()
export class UsersService {
  constructor(
    private findUserByIdEmailProvider: FindUserByIdEmailProvider,
    private findUserByIdProvider: FindUserByIdProvider,
    private updateUserRefreshTokenProvider: UpdateUserRefreshTokenProvider,
    private updateUserActiveStatusProvider: UpdateUserActiveStatusProvider,
    private createUserByAdminProvider: CreateUserByAdminProvider,
    private findAllUsersProvider: FindAllUsersProvider,
    private findUserByIdForAdminProvider: FindUserByIdForAdminProvider,
    private updateUserByAdminProvider: UpdateUserByAdminProvider,
    private deleteUserByAdminProvider: DeleteUserByAdminProvider,
  ) {}

  public findUserByEmail(email: string) {
    return this.findUserByIdEmailProvider.findUserByEmail(email);
  }

  public findUserById(id: string) {
    return this.findUserByIdProvider.findUserById(id);
  }

  public async findAllUsers(): Promise<SafeUser[]> {
    return this.findAllUsersProvider.findAllUsers();
  }

  public async findUserByIdForAdmin(userId: string): Promise<SafeUser> {
    return this.findUserByIdForAdminProvider.findUserByIdForAdmin(userId);
  }

  public async updateUserRefreshToken(userId: string, refreshToken: string) {
    return this.updateUserRefreshTokenProvider.updateUserRefreshToken(
      userId,
      refreshToken,
    );
  }

  public async updateUserActiveStatus(
    userId: string,
    isActive: boolean,
    superAdminId: string,
  ): Promise<SafeUser> {
    return this.updateUserActiveStatusProvider.updateUserActiveStatus(
      userId,
      isActive,
      superAdminId,
    );
  }

  public async updateUserByAdmin(
    userId: string,
    updateUserByAdminDto: UpdateUserByAdminDto,
    superAdminId: string,
  ): Promise<SafeUser> {
    return this.updateUserByAdminProvider.updateUserByAdmin(
      userId,
      updateUserByAdminDto,
      superAdminId,
    );
  }

  public async deleteUserByAdmin(
    userId: string,
    superAdminId: string,
  ): Promise<SafeUser> {
    return this.deleteUserByAdminProvider.deleteUserByAdmin(
      userId,
      superAdminId,
    );
  }

  public async createUserByAdmin(
    createUserByAdminDto: CreateUserByAdminDto,
    superAdminId: string,
  ): Promise<CreateUserByAdminResponse> {
    return this.createUserByAdminProvider.createUserByAdmin(
      createUserByAdminDto,
      superAdminId,
    );
  }

  public registerUser(email: string, password: string) {
    void email;
    void password;
  }
}
