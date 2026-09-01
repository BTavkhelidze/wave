import type { SendOutboundEmailPayload } from '../model/outboundEmail.types';
import { getOutboundEmailLanguageLabel } from '../model/outboundEmail.constants';

type EmailPreviewDialogProps = {
  values: SendOutboundEmailPayload;
  onClose: () => void;
};

export function EmailPreviewDialog({
  values,
  onClose,
}: EmailPreviewDialogProps) {
  const recipientName = values.recipientName?.trim();
  const greeting =
    values.language === 'KA'
      ? recipientName
        ? `\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0, ${recipientName}!`
        : '\u10D2\u10D0\u10DB\u10D0\u10E0\u10EF\u10DD\u10D1\u10D0!'
      : recipientName
        ? `Hello, ${recipientName}!`
        : 'Hello!';
  const heading = values.heading?.trim() || 'Wave Engineering';
  const buttonText = values.buttonText?.trim();
  const buttonUrl = values.buttonUrl?.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-preview-title"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2
              id="email-preview-title"
              className="text-base font-semibold text-[#111827]"
            >
              Preview Email
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {getOutboundEmailLanguageLabel(values.language)} template.
              Final rendering may vary between email clients.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          >
            Close
          </button>
        </div>

        <div className="bg-[#F3F6FA] px-4 py-8">
          <article className="mx-auto max-w-[600px] overflow-hidden border border-[#E5E7EB] bg-white">
            <header className="bg-[#0F4C81] px-7 py-5">
              <p className="text-lg font-semibold text-white">
                Wave Engineering
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/80">
                Business email
              </p>
            </header>

            <section className="px-7 py-7 text-[#111827]">
              <p className="mb-4 text-sm leading-6">{greeting}</p>
              <h3 className="text-2xl font-semibold leading-8 text-[#0F4C81]">
                {heading}
              </h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#374151]">
                {values.message || 'Your message will appear here.'}
              </p>
              {buttonText && buttonUrl && (
                <button
                  type="button"
                  disabled
                  className="mt-6 bg-[#D9272E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-100"
                >
                  {buttonText}
                </button>
              )}
            </section>

            <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-7 py-5 text-sm leading-6 text-[#6B7280]">
              <p>
                Wave Engineering provides fire protection, HVAC, plumbing, and
                engineering systems for business facilities.
              </p>
              <p className="mt-2">Website: https://waveengineering.ge</p>
              <p>Email: info@waveengineering.ge</p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
