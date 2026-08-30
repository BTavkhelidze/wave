import {
  AdminAction,
  AdminEntity,
  Language,
  OutboundEmailStatus,
  Prisma,
} from '@prisma/client';
import { MailService } from 'src/api/mail/mail.service';
import { PrismaService } from 'src/infra/infra/prisma/prisma.service';
import { SendOutboundEmailProvider } from './send-outbound-email.provider';

describe('SendOutboundEmailProvider', () => {
  const adminId = '99edc210-72d5-4969-9874-04269a600d77';
  const emailId = 'ab5a4c0f-7e19-42c3-8b95-905599b46c25';
  const dto = {
    recipientEmail: 'client@example.com',
    recipientName: 'Client',
    language: Language.KA,
    subject: 'Project update',
    heading: 'Hello',
    message: 'Private email body',
  };

  it('allows delivery status to finish updating even if the record is soft deleted', async () => {
    const tx = {
      outboundEmail: {
        update: jest.fn().mockResolvedValue({
          id: emailId,
          recipientEmail: dto.recipientEmail,
          language: dto.language,
          subject: dto.subject,
          status: OutboundEmailStatus.SENT,
          sentAt: new Date('2026-08-30T00:00:00.000Z'),
        }),
      },
      adminLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-id' }),
      },
    };
    const prismaService = {
      outboundEmail: {
        create: jest.fn().mockResolvedValue({ id: emailId }),
      },
      $transaction: jest.fn((callback: (txClient: typeof tx) => unknown) =>
        Promise.resolve(callback(tx)),
      ),
    };
    const mailService = {
      sendBusinessEmail: jest.fn().mockResolvedValue({
        providerMessageId: 'provider-message-id',
      }),
    };
    const provider = new SendOutboundEmailProvider(
      prismaService as unknown as PrismaService,
      mailService as unknown as MailService,
    );

    await expect(provider.send(dto, adminId)).resolves.toMatchObject({
      data: {
        id: emailId,
        status: OutboundEmailStatus.SENT,
      },
    });

    expect(tx.outboundEmail.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: emailId,
        },
        data: expect.objectContaining({
          status: OutboundEmailStatus.SENT,
          providerMessageId: 'provider-message-id',
        }) as Prisma.OutboundEmailUpdateInput,
      }),
    );
    expect(prismaService.outboundEmail.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          language: Language.KA,
        }) as Prisma.OutboundEmailCreateInput,
      }),
    );
    expect(mailService.sendBusinessEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        language: Language.KA,
      }),
    );
    expect(tx.outboundEmail.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
        }) as Prisma.OutboundEmailWhereUniqueInput,
      }),
    );
    expect(tx.adminLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        action: AdminAction.CREATE,
        entity: AdminEntity.OUTBOUND_EMAIL,
        entityId: emailId,
      },
    });
  });
});
