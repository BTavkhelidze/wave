import type { MailerOptions } from '@nestjs-modules/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const TLS_MIN_VERSION = 'TLSv1.2';

export type SmtpConfiguration = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
};

type SafeFallbackTransport = {
  streamTransport: true;
  buffer: true;
};

export function buildSmtpTransportOptions(
  smtp: SmtpConfiguration,
): SMTPTransport.Options | undefined {
  if (!hasCompleteSmtpConfiguration(smtp)) {
    return undefined;
  }

  const secure = resolveSecureMode(smtp.port, smtp.secure);
  const transport: SMTPTransport.Options = {
    host: smtp.host,
    port: smtp.port,
    secure,
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: TLS_MIN_VERSION,
    },
  };

  if (!secure) {
    transport.requireTLS = true;
  }

  return transport;
}

export function buildMailerOptions({
  smtp,
  from,
}: {
  smtp: SmtpConfiguration;
  from?: string;
}): MailerOptions {
  return {
    transport: buildSmtpTransportOptions(smtp) ?? buildSafeFallbackTransport(),
    defaults: {
      from,
    },
  };
}

function hasCompleteSmtpConfiguration(
  smtp: SmtpConfiguration,
): smtp is Required<SmtpConfiguration> {
  return Boolean(
    smtp.host &&
    smtp.port &&
    smtp.secure !== undefined &&
    smtp.user &&
    smtp.password,
  );
}

function resolveSecureMode(port: number, secure: boolean): boolean {
  if (port === 465 && secure) {
    return true;
  }

  if (port === 587 && !secure) {
    return false;
  }

  throw new Error(
    'MAIL_PORT and MAIL_SECURE are incompatible. Use MAIL_PORT=465 with MAIL_SECURE=true, or MAIL_PORT=587 with MAIL_SECURE=false for STARTTLS.',
  );
}

function buildSafeFallbackTransport(): SafeFallbackTransport {
  return {
    streamTransport: true,
    buffer: true,
  };
}
