import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class LogoutProvider {
  public logout(res: Response<any, Record<string, any>>) {
    res.clearCookie('refreshToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/' });

    return {
      message: 'User logged out successfully',
    };
  }
}
