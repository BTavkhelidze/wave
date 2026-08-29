import { randomBytes, createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordResetTokenProvider {
  public generateRawToken(): string {
    return randomBytes(32).toString('base64url');
  }

  public hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }
}
