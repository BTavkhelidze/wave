import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashProvider } from './hash.provider';

import { JwtService } from '@nestjs/jwt';
import { SignInProvider } from './signIn.provider';

@Injectable()
export class AuthService {
    constructor(
       
        private readonly signInProvider: SignInProvider
    ){}
    public async signIn(signInDto: SignInDto){
       return this.signInProvider.signIn(signInDto);
    }

    public async logout(){

    }
}
