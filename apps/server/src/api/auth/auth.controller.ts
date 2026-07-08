import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  public async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public logout(
    @Res({ passthrough: true }) res: Response<any, Record<string, any>>,
  ) {
    return this.authService.logout(res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  public async forgotPassword() {
    // return this.authService.forgotPassword();
  }

  @UseGuards(AccessTokenGuard)
  @Post('active-account')
  public async activeAccount(@Req() req) {
    return this.authService.activeAccount(req.user.email);
  }
}
