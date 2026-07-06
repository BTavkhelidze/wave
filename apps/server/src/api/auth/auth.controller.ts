import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

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

  @Post('logout')
  public async logout() {
    return this.authService.logout();
  }

  // @Auth(AuthT)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
