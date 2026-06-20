import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('signin')
  public async signIn(@Body() signInDto: SignInDto ){
    return this.authService.signIn(signInDto);
  }

  @Post('logout')
  public async logout(){
    return this.authService.logout();
  }
}
