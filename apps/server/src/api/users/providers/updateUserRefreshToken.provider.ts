import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

@Injectable()
export class UpdateUserRefreshTokenProvider {
  constructor(private readonly PrismaService: PrismaService) {}

  public async updateUserRefreshToken(userId: string, refreshToken: string) {
    const user = await this.PrismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: refreshToken,
      },
    });
    return user;
  }
}
