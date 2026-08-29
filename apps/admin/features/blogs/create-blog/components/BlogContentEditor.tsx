import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import {
  BLOG_CONTENT_IMAGE_ACCEPT,
  BLOG_CONTENT_IMAGE_MAX_SIZE_BYTES,
} from "../model/createBlogForm.constants";
import { BlogContentEditorToolbar } from "./BlogContentEditorToolbar";

type BlogContentEditorProps = {
  fieldId: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onUploadImage: (file: File) => Promise<{ url: string }>;
};

const allowedContentImageTypes = ["image/jpeg", "image/png", "image/webp"];

export function BlogContentEditor({
  fieldId,
  value,
  error,
  onChange,
  onBlur,
  onUploadImage,
}: BlogContentEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const errorId = `${fieldId}-error`;
  const imageErrorId = `${fieldId}-image-error`;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "blog-content-editor-image",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-describedby": error ? errorId : "",
        "aria-invalid": String(Boolean(error)),
        "aria-label": "Main blog content",
        class: "blog-content-editor-surface",
      },
    },
    onBlur,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const openImageDialog = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelection = async () => {
    const file = imageInputRef.current?.files?.[0];

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (!file || !editor) {
      return;
    }

    if (!allowedContentImageTypes.includes(file.type)) {
      setImageError("Select a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > BLOG_CONTENT_IMAGE_MAX_SIZE_BYTES) {
      setImageError("Image must not exceed 5 MB.");
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);

    try {
      const uploadedImage = await onUploadImage(file);

      editor
        .chain()
        .focus()
        .setImage({ src: uploadedImage.url, alt: file.name })
        .run();
    } catch {
      setImageError("Could not upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-[#111827]"
      >
        Main blog content
      </label>

      <input
        ref={imageInputRef}
        type="file"
        accept={BLOG_CONTENT_IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleImageSelection}
      />

      <div
        className={`mt-2 overflow-hidden rounded-md border bg-white transition focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 ${
          error ? "border-[#FCA5A5]" : "border-[#D1D5DB]"
        }`}
      >
        {editor && (
          <BlogContentEditorToolbar
            editor={editor}
            onAddImage={openImageDialog}
            hasImageError={Boolean(imageError)}
            isUploadingImage={isUploadingImage}
          />
        )}
        <EditorContent id={fieldId} editor={editor} />
      </div>

      {imageError && (
        <p id={imageErrorId} className="mt-2 text-sm text-[#DC2626]">
          {imageError}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-2 text-sm text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  );
}
