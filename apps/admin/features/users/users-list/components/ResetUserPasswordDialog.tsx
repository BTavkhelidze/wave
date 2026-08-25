type ResetUserPasswordDialogProps = {
  userEmail: string;
  isResetting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetUserPasswordDialog({
  userEmail,
  isResetting,
  errorMessage,
  onCancel,
  onConfirm,
}: ResetUserPasswordDialogProps) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 px-4'
      role='presentation'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='reset-user-password-dialog-title'
        className='w-full max-w-md rounded-lg border border-[#D1D5DB] bg-white shadow-xl'
      >
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h2
            id='reset-user-password-dialog-title'
            className='text-base font-semibold text-[#111827]'
          >
            Reset Password
          </h2>
        </div>

        <div className='space-y-3 px-5 py-4'>
          <p className='text-sm leading-6 text-[#374151]'>
            Reset password for {userEmail}?
          </p>
          <p className='text-sm leading-6 text-[#374151]'>
            The current password and active sessions will become invalid. A new
            one-time password will be sent to the user by email.
          </p>
          {errorMessage && (
            <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm leading-6 text-[#B91C1C]'>
              {errorMessage}
            </div>
          )}
        </div>

        <div className='flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isResetting}
            className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isResetting}
            className='rounded-md bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
