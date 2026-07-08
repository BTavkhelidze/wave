import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import {
  HttpException,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class FindUserByIdEmailProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async findUserByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) throw new UnauthorizedException('User does not exists');

      return user;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new RequestTimeoutException(err, {
        description: 'Could not fetch user',
      });
    }
  }
}
