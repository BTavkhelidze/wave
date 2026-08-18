import type { SendOutboundEmailPayload } from '../model/outboundEmail.types';

type SendEmailConfirmationDialogProps = {
  values: SendOutboundEmailPayload;
  isSending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SendEmailConfirmationDialog({
  values,
  isSending,
  onCancel,
  onConfirm,
}: SendEmailConfirmationDialogProps) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 px-4'
      role='presentation'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='send-email-dialog-title'
        className='w-full max-w-md rounded-lg border border-[#DDD6FE] bg-white shadow-xl'
      >
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h2
            id='send-email-dialog-title'
            className='text-base font-semibold text-[#111827]'
          >
            Send Email
          </h2>
        </div>

        <div className='space-y-4 px-5 py-4'>
          <p className='text-sm leading-6 text-[#374151]'>
            This email will be sent immediately and cannot be recalled from the
            Admin Panel.
          </p>
          <dl className='space-y-3 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm'>
            {values.recipientName && (
              <DetailItem label='Recipient name' value={values.recipientName} />
            )}
            <DetailItem label='Recipient email' value={values.recipientEmail} />
            <DetailItem label='Subject' value={values.subject} />
          </dl>
        </div>

        <div className='flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isSending}
            className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isSending}
            className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className='text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
        {label}
      </dt>
      <dd className='mt-1 wrap-break-word font-medium text-[#111827]'>
        {value}
      </dd>
    </div>
  );
}
