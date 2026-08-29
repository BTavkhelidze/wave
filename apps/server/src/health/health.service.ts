import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';

export type HealthResponse = {
  status: 'ok';
};

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  liveness(): HealthResponse {
    return { status: 'ok' };
  }

  async readiness(): Promise<HealthResponse> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Service is not ready');
    }
  }
}
