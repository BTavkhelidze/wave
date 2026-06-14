import { Injectable } from '@nestjs/common';
import { FindUserByIdEmailProvider } from './findUserByEmail.provider';

@Injectable()
export class UsersService {
    constructor(private findUserByIdEmailProvider: FindUserByIdEmailProvider){

    }
    
    public findUserByEmail (email:string){
        return this.findUserByIdEmailProvider.findUserByEmail(email)
    }
}
