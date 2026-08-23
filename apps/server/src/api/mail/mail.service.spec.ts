import type { MailerService } from '@nestjs-modules/mailer';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import { MailDeliveryError, MailService } from './mail.service';

describe('MailService', () => {
  const contactMessage = {
    id: 'ab5a4c0f-7e19-42c3-8b95-905599b46c25',
    fullName: 'John <Doe>',
    email: 'john@example.com',
    phone: '+995555123456',
    subject: 'Fire & safety',
    message: 'Hello <script>alert(1)</script>\nSecond line',
    createdAt: new Date('2026-08-15T00:00:00.000Z'),
  };

  let sendMail: jest.Mock<Promise<void>, [unknown]>;
  let service: MailService;

  beforeEach(() => {
    sendMail = jest.fn<Promise<void>, [unknown]>().mockResolvedValue();
    service = new MailService(
      {
        adminAppUrl: 'https://admin.waveengineering.ge/',
        mail: {
          from: 'Wave Engineering <info@waveengineering.ge>',
          contactNotificationEmail: 'admin@waveengineering.ge',
          provider: 'smtp',
          smtp: {
            host: 'smtp.example.test',
            port: 465,
            user: 'info@waveengineering.ge',
            password: 'secret',
          },
        },
      } as ConfigType<typeof appConfig>,
      { sendMail } as unknown as MailerService,
    );
  });

  it('sends new contact message notifications from the company mailbox with visitor replyTo', async () => {
    await service.sendNewContactMessageNotification(contactMessage);

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Wave Engineering <info@waveengineering.ge>',
        to: 'admin@waveengineering.ge',
        replyTo: contactMessage.email,
        subject: 'New contact message received',
      }),
    );
  });

  it('escapes visitor-provided values in the HTML notification', async () => {
    await service.sendNewContactMessageNotification(contactMessage);

    const input = sendMail.mock.calls[0]?.[0] as
      | { html?: string; text?: string }
      | undefined;

    expect(input?.html).toContain('John &lt;Doe&gt;');
    expect(input?.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(input?.html).toContain('https://admin.waveengineering.ge/messages');
    expect(input?.text).toContain(
      'Open messages: https://admin.waveengineering.ge/messages',
    );
  });

  it('sanitizes SMTP TLS certificate failures', async () => {
    const certificateError = Object.assign(
      new Error('self-signed certificate in certificate chain'),
      {
        code: 'ESOCKET',
        command: 'CONN',
      },
    );
    sendMail.mockRejectedValueOnce(certificateError);

    await expect(
      service.sendMail({
        to: 'recipient@example.com',
        subject: 'Security notice',
        text: 'Hello',
      }),
    ).rejects.toMatchObject({
      name: MailDeliveryError.name,
      message: 'Email delivery failed',
      deliveryCode: 'ESOCKET',
    });
  });
});
