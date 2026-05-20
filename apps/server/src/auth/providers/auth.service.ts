import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dtos/signIn.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashProvider } from './hash.provider';
import { jwt } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly hashProvider: HashProvider){}
    public async signIn(signInDto: SignInDto){
        const user = await this.userService.findUserByEmail(signInDto.email);
        const res = await this.hashProvider.comparePassword(signInDto.password, user.password);
    if(!res) throw new UnauthorizedException('Email or password is incorrect');

    }

    public async logout(){

    }
}
