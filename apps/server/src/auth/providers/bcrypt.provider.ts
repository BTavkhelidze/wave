import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashProvider } from './hash.provider';

@Injectable()
export class BcryptProvider implements HashProvider {

        public async hashPassword(data:string | Buffer): Promise<string>{
            const salt = await bcrypt.genSalt(10); 
            return bcrypt.hash(data, salt);
        }


        public async comparePassword(data: string| Buffer, encrypted: string  ):Promise<boolean>{
            return bcrypt.compare(data, encrypted)
        }
}
