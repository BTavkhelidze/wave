import { Language } from '@prisma/client';
import {
  buildBodyText,
  buildButton,
  buildParagraph,
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

const emailTemplateTranslations = {
  [Language.EN]: {
    greetingWithName: (name: string) => `Hello, ${name}!`,
    greetingWithoutName: 'Hello!',
  },
  [Language.KA]: {
    greetingWithName: (name: string) =>
      `\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0, ${name}!`,
    greetingWithoutName:
      '\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0!',
  },
} as const satisfies Record<
  Language,
  {
    greetingWithName: (name: string) => string;
    greetingWithoutName: string;
  }
>;

export function buildBusinessEmailContent(
  input: BusinessEmailTemplateInput,
): BusinessEmailContent {
  return {
    text: buildBusinessEmailText(input),
    html: buildBusinessEmailHtml(input),
  };
}

function buildBusinessEmailText({
  recipientName,
  language = Language.EN,
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  const translations = emailTemplateTranslations[language];
  const greeting = recipientName
    ? translations.greetingWithName(recipientName)
    : translations.greetingWithoutName;

  return [
    greeting,
    '',
    heading,
    '',
    message,
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
  recipientName,
  language = Language.EN,
  subject,
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  const translations = emailTemplateTranslations[language];
  const safeGreeting = recipientName
    ? translations.greetingWithName(escapeHtml(recipientName))
    : translations.greetingWithoutName;
  const safeHeading = heading ? escapeHtml(heading) : '';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeButtonText = buttonText ? escapeHtml(buttonText) : '';
  const safeButtonUrl =
    buttonUrl && isSafeHttpUrl(buttonUrl) ? escapeHtml(buttonUrl) : '';

  return buildWaveEmailLayout({
    language,
    preheader: heading ?? subject,
    contentHtml: [
      buildParagraph(safeGreeting),
      safeHeading ? buildSectionHeading(safeHeading) : '',
      buildBodyText(safeMessage),
      safeButtonText && safeButtonUrl
        ? buildButton({ href: safeButtonUrl, label: safeButtonText })
        : '',
    ].join(''),
  });
}
