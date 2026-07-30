import { Injectable } from '@nestjs/common';
import { FindAdminLogsQueryDto } from '../dtos/find-admin-logs-query.dto';
import {
  FindAdminLogsProvider,
  type FindAdminLogsResponse,
} from './find-admin-logs.provider';

@Injectable()
export class AdminLogsService {
  constructor(private readonly findAdminLogsProvider: FindAdminLogsProvider) {}

  public findAdminLogs(
    query: FindAdminLogsQueryDto,
  ): Promise<FindAdminLogsResponse> {
    return this.findAdminLogsProvider.findAdminLogs(query);
  }
}
