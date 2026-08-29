import {
  buildBodyText,
  buildButton,
  buildFinalInfoRow,
  buildInfoPanel,
  buildParagraph,
  buildSectionHeading,
  buildWaveEmailLayout,
  escapeHtml,
  isSafeHttpUrl,
} from './wave-email-layout.template';

export type BusinessEmailTemplateInput = {
  recipientName?: string;
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
  recipientName,
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';

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
  subject,
  heading,
  message,
  buttonText,
  buttonUrl,
}: BusinessEmailTemplateInput): string {
  const safeGreeting = recipientName
    ? `Hello ${escapeHtml(recipientName)},`
    : 'Hello,';
  const safeSubject = escapeHtml(subject);
  const safeHeading = heading ? escapeHtml(heading) : '';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeButtonText = buttonText ? escapeHtml(buttonText) : '';
  const safeButtonUrl =
    buttonUrl && isSafeHttpUrl(buttonUrl) ? escapeHtml(buttonUrl) : '';

  return buildWaveEmailLayout({
    preheader: heading ?? subject,
    contentHtml: [
      buildParagraph(safeGreeting),
      safeHeading ? buildSectionHeading(safeHeading) : '',
      buildInfoPanel([buildFinalInfoRow('Subject', safeSubject)]),
      buildBodyText(safeMessage),
      safeButtonText && safeButtonUrl
        ? buildButton({ href: safeButtonUrl, label: safeButtonText })
        : '',
    ].join(''),
  });
}
