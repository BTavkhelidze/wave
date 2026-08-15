import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

export type UnreadContactMessageCountResponse = {
  count: number;
};

@Injectable()
export class GetUnreadContactMessageCountProvider {
  private readonly logger = new Logger(
    GetUnreadContactMessageCountProvider.name,
  );

  constructor(private readonly prismaService: PrismaService) {}

  public async getCount(): Promise<UnreadContactMessageCountResponse> {
    try {
      const count = await this.prismaService.contactMessage.count({
        where: {
          status: MessageStatus.UNREAD,
        },
      });

      return { count };
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      this.logger.error(`Unread contact message count failed: ${errorName}.`);

      throw new InternalServerErrorException(
        'Could not fetch unread contact message count',
      );
    }
  }
}
