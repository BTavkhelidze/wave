import { useRef, type DragEvent, type KeyboardEvent } from 'react';

import { COVER_IMAGE_ACCEPT } from '../model/createBlogForm.constants';
import { formatFileSize } from '../model/createBlogForm.schema';
import { CreateBlogPanel } from './CreateBlogPanel';

type CoverImageSectionProps = {
  selectedFile: File | null;
  previewUrl: string | null;
  error?: string;
  onSelectFile: (file: File) => void;
  onRemoveFile: () => void;
};

export function CoverImageSection({
  selectedFile,
  previewUrl,
  error,
  onSelectFile,
  onRemoveFile,
}: CoverImageSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const errorId = 'create-blog-cover-image-error';

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleInputChange = () => {
    const file = inputRef.current?.files?.[0];

    if (file) {
      onSelectFile(file);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (file) {
      onSelectFile(file);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  return (
    <CreateBlogPanel
      title='Cover image'
      description='Choose a local JPEG, PNG, or WebP image for the blog header.'
    >
      <input
        ref={inputRef}
        id='create-blog-cover-image'
        type='file'
        accept={COVER_IMAGE_ACCEPT}
        className='sr-only'
        onChange={handleInputChange}
      />

      <div
        role='button'
        tabIndex={0}
        aria-label='Select cover image'
        aria-describedby={error ? errorId : undefined}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className='group cursor-pointer rounded-lg border border-dashed border-[#C4B5FD] bg-[#F8FAFC] p-4 text-center outline-none transition hover:border-[#7C3AED] hover:bg-[#F5F3FF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
      >
        {previewUrl && selectedFile ? (
          <div className='space-y-3'>
            <div className='overflow-hidden rounded-md border border-[#E5E7EB] bg-white'>
              <img
                src={previewUrl}
                alt='Selected blog cover preview'
                className='h-44 w-full object-cover'
              />
            </div>
            <div className='text-left'>
              <p className='truncate text-sm font-medium text-[#111827]'>
                {selectedFile.name}
              </p>
              <p className='mt-1 text-xs text-[#6B7280]'>
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className='flex min-h-44 flex-col items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-8'>
            <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3FF] text-[#7C3AED] transition group-hover:bg-[#EDE9FE]'>
              <svg
                aria-hidden='true'
                className='h-5 w-5'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.8'
                viewBox='0 0 24 24'
              >
                <path d='M12 5v14' />
                <path d='M5 12h14' />
              </svg>
            </span>
            <p className='mt-3 text-sm font-medium text-[#111827]'>
              Drop an image here or click to browse
            </p>
            <p className='mt-1 text-xs leading-5 text-[#6B7280]'>
              JPEG, PNG, or WebP. Maximum size: 5 MB.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className='text-sm text-[#DC2626]'>
          {error}
        </p>
      )}

      <div className='flex flex-col gap-3 sm:flex-row'>
        <button
          type='button'
          onClick={openFileDialog}
          className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          {selectedFile ? 'Replace image' : 'Select image'}
        </button>
        {selectedFile && (
          <button
            type='button'
            onClick={onRemoveFile}
            className='rounded-md border border-[#FCA5A5] bg-white px-4 py-2 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20'
          >
            Remove image
          </button>
        )}
      </div>
    </CreateBlogPanel>
  );
}
