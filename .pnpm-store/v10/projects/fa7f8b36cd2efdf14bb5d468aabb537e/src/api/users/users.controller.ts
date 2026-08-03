import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UpdateUserActiveStatusDto } from './dtos/update-user-active-status.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateUserByAdminDto } from './dtos/create-user-by-admin.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import type { CreateUserByAdminResponse } from './providers/createUserByAdmin.provider';
import type { SafeUser } from './constants/safe-user-select.constant';
import { UpdateUserByAdminDto } from './dtos/update-user-by-admin.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  public findAllUsers(): Promise<SafeUser[]> {
    return this.usersService.findAllUsers();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':userId')
  public findUserByIdForAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SafeUser> {
    return this.usersService.findUserByIdForAdmin(userId);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('admin')
  public createUserByAdmin(
    @Body() createUserByAdminDto: CreateUserByAdminDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<CreateUserByAdminResponse> {
    return this.usersService.createUserByAdmin(
      createUserByAdminDto,
      activeUser.sub,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':userId/active-status')
  public updateUserActiveStatus(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserActiveStatusDto: UpdateUserActiveStatusDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<SafeUser> {
    return this.usersService.updateUserActiveStatus(
      userId,
      updateUserActiveStatusDto.isActive,
      activeUser.sub,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':userId')
  public updateUserByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserByAdminDto: UpdateUserByAdminDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<SafeUser> {
    return this.usersService.updateUserByAdmin(
      userId,
      updateUserByAdminDto,
      activeUser.sub,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':userId')
  public deleteUserByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<SafeUser> {
    return this.usersService.deleteUserByAdmin(userId, activeUser.sub);
  }
}
