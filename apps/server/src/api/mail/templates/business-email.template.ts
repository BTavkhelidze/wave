export type BusinessEmailTemplateInput = {
  recipientName?: string;
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

const BRAND_BLUE = '#0F4C81';
const BRAND_RED = '#D9272E';
const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#6B7280';
const BORDER_COLOR = '#DDE5EF';
const OUTER_BACKGROUND = '#F4F7FB';

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
    'Engineering that protects, performs, and lasts.',
    '',
    'Wave Engineering',
  ]
    .filter((line): line is string => line !== undefined)
    .join('\n');
}

function buildBusinessEmailHtml({
  recipientName,
  heading,
  message,
  buttonText,
  buttonUrl,
  logoUrl,
}: BusinessEmailTemplateInput): string {
  const safeGreeting = recipientName
    ? `Hello ${escapeHtml(recipientName)},`
    : 'Hello,';
  const safeHeading = heading ? escapeHtml(heading) : '';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeButtonText = buttonText ? escapeHtml(buttonText) : '';
  const safeButtonUrl =
    buttonUrl && isSafeHttpUrl(buttonUrl) ? escapeHtml(buttonUrl) : '';
  const safeLogoUrl = escapeHtml(logoUrl);
  const preheader = escapeHtml(heading ?? 'A message from Wave Engineering');
  const year = new Date().getFullYear();

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .wave-email-shell { padding: 24px 12px !important; }
            .wave-email-content { padding: 30px 22px 28px !important; }
            .wave-email-header { padding: 22px 22px !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:${OUTER_BACKGROUND};">
        <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${OUTER_BACKGROUND};opacity:0;">
          ${preheader}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${OUTER_BACKGROUND};margin:0;padding:0;">
          <tr>
            <td align="center" class="wave-email-shell" style="padding:42px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid ${BORDER_COLOR};border-radius:14px;border-collapse:separate;overflow:hidden;">
                <tr>
                  <td class="wave-email-header" style="padding:24px 36px;background:${BRAND_BLUE};font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${safeLogoUrl}" width="132" height="74" alt="WAVE ENGINEERING" style="display:block;width:132px;height:auto;border:0;outline:none;text-decoration:none;color:#FFFFFF;font-size:16px;font-weight:700;line-height:20px;">
                          <div style="margin-top:8px;font-size:11px;line-height:14px;letter-spacing:2px;color:#FFFFFF;font-weight:700;">WAVE ENGINEERING</div>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="42" height="3" style="background:${BRAND_RED};font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                            <tr>
                              <td height="7" style="font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                            <tr>
                              <td width="28" height="3" style="background:#FFFFFF;font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="wave-email-content" style="padding:44px 46px 38px;font-family:Arial,Helvetica,sans-serif;color:${TEXT_COLOR};">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 0 22px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="58" height="1" style="background:${BRAND_RED};font-size:0;line-height:0;">&nbsp;</td>
                              <td width="8" style="font-size:0;line-height:0;">&nbsp;</td>
                              <td width="1" height="1" style="background:${BORDER_COLOR};font-size:0;line-height:0;">&nbsp;</td>
                              <td style="border-top:1px solid ${BORDER_COLOR};font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:16px;line-height:26px;color:${TEXT_COLOR};">
                          <p style="margin:0 0 20px;font-size:16px;line-height:26px;color:${TEXT_COLOR};">${safeGreeting}</p>
                          ${safeHeading ? `<h1 style="margin:0 0 22px;font-size:28px;line-height:36px;color:${BRAND_BLUE};font-weight:700;letter-spacing:0;">${safeHeading}</h1>` : ''}
                          <p style="margin:0;font-size:16px;line-height:28px;color:${TEXT_COLOR};word-break:break-word;overflow-wrap:break-word;">${safeMessage}</p>
                        </td>
                      </tr>
                      ${
                        safeButtonText && safeButtonUrl
                          ? `<tr>
                        <td style="padding:30px 0 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td bgcolor="${BRAND_RED}" style="background:${BRAND_RED};border-radius:6px;">
                                <a href="${safeButtonUrl}" target="_blank" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:18px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:6px;">${safeButtonText}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding:34px 0 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${BORDER_COLOR};">
                            <tr>
                              <td style="padding:18px 0 0;font-size:13px;line-height:20px;color:${MUTED_COLOR};font-style:italic;">
                                Engineering that protects, performs, and lasts.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 46px;background:#F8FAFC;border-top:1px solid ${BORDER_COLOR};font-family:Arial,Helvetica,sans-serif;color:${MUTED_COLOR};font-size:12px;line-height:18px;">
                    &copy; ${year} Wave Engineering
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
