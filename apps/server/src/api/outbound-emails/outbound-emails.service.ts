import { Injectable } from '@nestjs/common';
import { FindOutboundEmailsQueryDto } from './dto/find-outbound-emails-query.dto';
import { SendOutboundEmailDto } from './dto/send-outbound-email.dto';
import { DeleteOutboundEmailProvider } from './providers/delete-outbound-email.provider';
import { FindOutboundEmailByIdProvider } from './providers/find-outbound-email-by-id.provider';
import {
  FindOutboundEmailsProvider,
  type FindOutboundEmailsResponse,
} from './providers/find-outbound-emails.provider';
import {
  SendOutboundEmailProvider,
  type SendOutboundEmailResponse,
} from './providers/send-outbound-email.provider';
import type { OutboundEmailDetail } from './providers/outbound-email-select.constant';

@Injectable()
export class OutboundEmailsService {
  constructor(
    private readonly sendOutboundEmailProvider: SendOutboundEmailProvider,
    private readonly deleteOutboundEmailProvider: DeleteOutboundEmailProvider,
    private readonly findOutboundEmailsProvider: FindOutboundEmailsProvider,
    private readonly findOutboundEmailByIdProvider: FindOutboundEmailByIdProvider,
  ) {}

  public send(
    dto: SendOutboundEmailDto,
    adminId: string,
  ): Promise<SendOutboundEmailResponse> {
    return this.sendOutboundEmailProvider.send(dto, adminId);
  }

  public findMany(
    query: FindOutboundEmailsQueryDto,
  ): Promise<FindOutboundEmailsResponse> {
    return this.findOutboundEmailsProvider.findMany(query);
  }

  public findOne(id: string): Promise<OutboundEmailDetail> {
    return this.findOutboundEmailByIdProvider.findOne(id);
  }

  public delete(id: string, adminId: string): Promise<void> {
    return this.deleteOutboundEmailProvider.delete(id, adminId);
  }
}
