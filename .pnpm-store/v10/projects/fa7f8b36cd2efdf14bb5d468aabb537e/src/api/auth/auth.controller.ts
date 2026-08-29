import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ActiveUser } from './decorators/active-user.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import type { ChangePasswordResponse } from './providers/change-password.provider';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import type { ForgotPasswordResponse } from './providers/forgot-password.provider';
import type { ResetPasswordResponse } from './providers/reset-password.provider';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ) {
    console.log('signInDto', signInDto);
    return this.authService.signIn(signInDto, res);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  public logout(
    @ActiveUser('id') activeUserId: string,
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ) {
    return this.authService.logout(activeUserId, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  public async refreshToken(
    @Req() req: Request,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ) {
    const refreshToken =
      typeof req.cookies?.refreshToken === 'string'
        ? req.cookies.refreshToken
        : refreshTokenDto.refreshToken;

    if (!refreshToken) {
      return this.authService.refreshToken('', res);
    }

    return this.authService.refreshToken(refreshToken, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset instructions' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description: 'Generic response returned regardless of account existence.',
  })
  public async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(forgotPasswordDto, req.ip);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a password reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Password was reset successfully.',
  })
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(resetPasswordDto, res);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('change-password')
  public changePassword(
    @ActiveUser('id') activeUserId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(activeUserId, changePasswordDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('active-account')
  public async activeAccount(@ActiveUser('email') activeUserEmail: string) {
    return this.authService.activeAccount(activeUserEmail);
  }
}
