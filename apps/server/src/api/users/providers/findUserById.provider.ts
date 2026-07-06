import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class FindUserByIdProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async findUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new UnauthorizedException('User does not exists');

    return user;
  }
}
