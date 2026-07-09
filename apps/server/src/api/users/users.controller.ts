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
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreateUserByAdminDto } from './dtos/create-user-by-admin.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import type { CreateUserByAdminResponse } from './providers/createUserByAdmin.provider';
import type { SafeUser } from './constants/safe-user-select.constant';
import { UpdateUserByAdminDto } from './dtos/update-user-by-admin.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
  @Get()
  public findAllUsers(): Promise<SafeUser[]> {
    return this.usersService.findAllUsers();
  }

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
  @Get(':userId')
  public findUserByIdForAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SafeUser> {
    return this.usersService.findUserByIdForAdmin(userId);
  }

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
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

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
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

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
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

  @UseGuards(AccessTokenGuard, SuperAdminGuard)
  @Delete(':userId')
  public deleteUserByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<SafeUser> {
    return this.usersService.deleteUserByAdmin(userId, activeUser.sub);
  }
}
