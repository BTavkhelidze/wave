import { Language } from '@prisma/client';
import {
  buildBodyText,
  buildButton,
  buildSectionHeading,
  buildWaveEmailLayout,
  escapeHtml,
  isSafeHttpUrl,
} from './wave-email-layout.template';

export type BusinessEmailTemplateInput = {
  recipientName?: string;
  language?: Language;
  subject: string;
  heading?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  websiteUrl: string;
  logoUrl: string;
};

export type BusinessEmailContent = {
  text: string;
  html: string;
};

export function buildBusinessEmailContent(
  input: BusinessEmailTemplateInput,
): BusinessEmailContent {
  return {
    text: buildBusinessEmailText(input),
    html: buildBusinessEmailHtml(input),
  };
}

function buildBusinessEmailText({
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  return [
    ...(heading ? [heading, '', message] : [message]),
    '',
    buttonText && buttonUrl ? `${buttonText}: ${buttonUrl}` : undefined,
    '',
    'Water Air Voltage Engineering',
    '',
    'Wave Engineering',
  ]
    .filter((line): line is string => line !== undefined)
    .join('\n');
}

function buildBusinessEmailHtml({
  language = Language.EN,
  subject,
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  const safeHeading = heading ? escapeHtml(heading) : '';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeButtonText = buttonText ? escapeHtml(buttonText) : '';
  const safeButtonUrl =
    buttonUrl && isSafeHttpUrl(buttonUrl) ? escapeHtml(buttonUrl) : '';

  return buildWaveEmailLayout({
    language,
    preheader: heading ?? subject,
    contentHtml: [
      safeHeading ? buildSectionHeading(safeHeading) : '',
      buildBodyText(safeMessage),
      safeButtonText && safeButtonUrl
        ? buildButton({ href: safeButtonUrl, label: safeButtonText })
        : '',
    ].join(''),
  });
}
