import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { HashProvider } from './hash.provider';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class BcryptProvider implements HashProvider {
  public hashPassword(data: string | Buffer): Promise<string> {
    return hash(data, BCRYPT_SALT_ROUNDS);
  }

  public comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    return compare(data, encrypted);
  }
}
