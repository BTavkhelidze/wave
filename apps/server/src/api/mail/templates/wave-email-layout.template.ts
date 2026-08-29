const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#6B7280';
const BORDER_COLOR = '#E5E7EB';
const OUTER_BACKGROUND = '#F8FAFC';
const BRAND_COLOR = '#111827';
const ACCENT_COLOR = '#7C3AED';
const WARNING_COLOR = '#92400E';

export type WaveEmailLayoutInput = {
  preheader: string;
  contentHtml: string;
};

export function buildWaveEmailLayout({
  preheader,
  contentHtml,
}: WaveEmailLayoutInput): string {
  const year = new Date().getFullYear();

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .wave-email-shell { padding: 18px 12px !important; }
            .wave-email-card { padding: 22px !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:${OUTER_BACKGROUND};">
        <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${OUTER_BACKGROUND};opacity:0;">
          ${escapeHtml(preheader)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${OUTER_BACKGROUND};margin:0;padding:0;">
          <tr>
            <td align="center" class="wave-email-shell" style="padding:24px 16px;">
              <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;border-collapse:separate;">
                <tr>
                  <td class="wave-email-card" style="background:#FFFFFF;border:1px solid ${BORDER_COLOR};border-radius:8px;padding:24px;font-family:Arial,Helvetica,sans-serif;color:${TEXT_COLOR};line-height:1.6;">
                    <h1 style="margin:0;font-size:22px;line-height:1.3;color:${BRAND_COLOR};font-weight:700;">WAVE</h1>
                    <p style="margin:4px 0 20px;font-size:12px;line-height:18px;letter-spacing:0;color:${MUTED_COLOR};">Water Air Voltage Engineering</p>
                    ${contentHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 6px 0;font-family:Arial,Helvetica,sans-serif;color:${MUTED_COLOR};font-size:12px;line-height:18px;text-align:center;">
                    &copy; ${year} Wave Engineering<br>
                    Water Air Voltage Engineering
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

export function buildInfoPanel(rows: string[]): string {
  if (rows.length === 0) {
    return '';
  }

  return `
    <div style="margin:0 0 20px;padding:16px;border:1px solid ${BORDER_COLOR};border-radius:8px;background:#F9FAFB;">
      ${rows.join('')}
    </div>
  `;
}

export function buildButton({
  href,
  label,
}: {
  href: string;
  label: string;
}): string {
  return `
    <p style="margin:0 0 22px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 18px;border-radius:6px;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;line-height:18px;">${label}</a>
    </p>
  `;
}

export function buildWarningText(html: string): string {
  return `<p style="margin:0 0 12px;color:${WARNING_COLOR};">${html}</p>`;
}

export function buildMutedText(html: string): string {
  return `<p style="margin:0;color:${MUTED_COLOR};">${html}</p>`;
}

export function buildParagraph(html: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;line-height:24px;color:${TEXT_COLOR};">${html}</p>`;
}

export function buildBodyText(html: string): string {
  return `<p style="margin:0 0 22px;font-size:15px;line-height:24px;color:${TEXT_COLOR};word-break:break-word;overflow-wrap:break-word;">${html}</p>`;
}

export function buildInfoRow(label: string, valueHtml: string): string {
  return `<p style="margin:0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${valueHtml}</p>`;
}

export function buildFinalInfoRow(label: string, valueHtml: string): string {
  return `<p style="margin:0;"><strong>${escapeHtml(label)}:</strong> ${valueHtml}</p>`;
}

export function buildSectionHeading(html: string): string {
  return `<h2 style="margin:0 0 14px;font-size:20px;line-height:28px;color:${ACCENT_COLOR};font-weight:700;">${html}</h2>`;
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
