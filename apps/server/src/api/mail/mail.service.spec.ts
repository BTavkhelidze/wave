import type { MailerService } from '@nestjs-modules/mailer';
import type { ConfigType } from '@nestjs/config';
import { Language } from '@prisma/client';
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
        publicWebsiteUrl: 'https://waveengineering.ge/',
        emailLogoUrl: '',
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

  it('sends temporary-password emails with the shared WAVE layout and escaped values', async () => {
    await service.sendAdminTemporaryPasswordEmail({
      to: 'new.admin+<test>@example.com',
      temporaryPassword: 'Temp<pass>&"',
      reason: 'USER_CREATED',
    });

    const input = sendMail.mock.calls[0]?.[0] as
      | { html?: string; text?: string; subject?: string }
      | undefined;

    expect(input?.subject).toBe('Your Wave Engineering admin account');
    expect(input?.html).toContain('WAVE');
    expect(input?.html).toContain('Water Air Voltage Engineering');
    expect(input?.html).not.toContain('<img');
    expect(input?.html).toContain('Open admin panel');
    expect(input?.html).toContain('new.admin+&lt;test&gt;@example.com');
    expect(input?.html).toContain('Temp&lt;pass&gt;&amp;&quot;');
    expect(input?.text).toContain('One-time password: Temp<pass>&"');
  });

  it('sends ComposeEmail messages with the shared WAVE layout and escaped dynamic content', async () => {
    await service.sendBusinessEmail({
      to: 'client@example.com',
      subject: 'Quarterly <Plan>',
      recipientName: 'Ana <Admin>',
      heading: 'Project <Update>',
      message: 'Line <one>\nLine & two',
      buttonText: 'Open <Plan>',
      buttonUrl: 'https://example.com/plan?x=1&y=2',
    });

    const input = sendMail.mock.calls[0]?.[0] as
      | { html?: string; text?: string; subject?: string }
      | undefined;

    expect(input?.subject).toBe('Quarterly <Plan>');
    expect(input?.html).toContain('WAVE');
    expect(input?.html).toContain('Water Air Voltage Engineering');
    expect(input?.html).not.toContain('<img');
    expect(input?.html).not.toContain('Hello, Ana &lt;Admin&gt;!');
    expect(input?.html).toContain('Project &lt;Update&gt;');
    expect(input?.html).not.toContain('<strong>Subject:</strong>');
    expect(input?.html).toContain('Line &lt;one&gt;<br>Line &amp; two');
    expect(input?.html).toContain('Open &lt;Plan&gt;');
    expect(input?.html).toContain(
      'href="https://example.com/plan?x=1&amp;y=2"',
    );
    expect(input?.text).not.toContain('Hello, Ana <Admin>!');
    expect(input?.text).toContain('Project <Update>\n\nLine <one>');
    expect(input?.text).toContain(
      'Open <Plan>: https://example.com/plan?x=1&y=2',
    );
  });

  it('does not add ComposeEmail greetings from recipient names', async () => {
    await service.sendBusinessEmail({
      to: 'client@example.com',
      subject: 'Georgian update',
      language: Language.KA,
      recipientName: 'Beqa Tavkhelidze',
      message: 'Message body',
    });

    const input = sendMail.mock.calls[0]?.[0] as
      | { html?: string; text?: string }
      | undefined;
    const greeting =
      '\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0, Beqa Tavkhelidze!';

    expect(input?.html).not.toContain(greeting);
    expect(input?.text).not.toContain(greeting);
    expect(input?.html).toContain('Message body');
    expect(input?.text).toContain('Message body');
  });

  it('does not add ComposeEmail greetings without recipient names', async () => {
    await service.sendBusinessEmail({
      to: 'client@example.com',
      subject: 'English update',
      language: Language.EN,
      message: 'Message body',
    });

    await service.sendBusinessEmail({
      to: 'client@example.com',
      subject: 'Georgian update',
      language: Language.KA,
      message: 'Message body',
    });

    const englishInput = sendMail.mock.calls[0]?.[0] as
      | { html?: string; text?: string }
      | undefined;
    const georgianInput = sendMail.mock.calls[1]?.[0] as
      | { html?: string; text?: string }
      | undefined;
    const georgianGreeting =
      '\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0!';

    expect(englishInput?.html).not.toContain('Hello!');
    expect(englishInput?.text).not.toContain('Hello!');
    expect(georgianInput?.html).not.toContain(georgianGreeting);
    expect(georgianInput?.text).not.toContain(georgianGreeting);
    expect(englishInput?.text?.startsWith('Message body')).toBe(true);
    expect(georgianInput?.text?.startsWith('Message body')).toBe(true);
  });

  it('omits the ComposeEmail button when the URL is not safe', async () => {
    await service.sendBusinessEmail({
      to: 'client@example.com',
      subject: 'Plain update',
      message: 'No action required.',
      buttonText: 'Open report',
      buttonUrl: 'javascript:alert(1)',
    });

    const input = sendMail.mock.calls[0]?.[0] as { html?: string } | undefined;

    expect(input?.html).not.toContain('javascript:alert(1)');
    expect(input?.html).not.toContain('Open report</a>');
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
