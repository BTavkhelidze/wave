type CreateBlogFormActionsProps = {
  canSubmit: boolean;
  isSubmitting: boolean;
  submitIntent: 'draft' | 'publish';
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function CreateBlogFormActions({
  canSubmit,
  isSubmitting,
  submitIntent,
  onCancel,
  onSaveDraft,
  onPublish,
}: CreateBlogFormActionsProps) {
  return (
    <div className='flex flex-col-reverse gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm sm:flex-row sm:justify-end'>
      <button
        type='button'
        onClick={onCancel}
        disabled={isSubmitting}
        className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
      >
        Cancel
      </button>
      <button
        type='submit'
        name='intent'
        value='draft'
        onClick={onSaveDraft}
        disabled={!canSubmit || isSubmitting}
        className='rounded-md border border-[#C4B5FD] bg-white px-4 py-2 text-sm font-semibold text-[#6D28D9] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {isSubmitting && submitIntent === 'draft'
          ? 'Saving...'
          : 'Save as Draft'}
      </button>
      <button
        type='submit'
        name='intent'
        value='publish'
        onClick={onPublish}
        disabled={!canSubmit || isSubmitting}
        className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {isSubmitting && submitIntent === 'publish'
          ? 'Publishing...'
          : 'Publish Blog'}
      </button>
    </div>
  );
}
