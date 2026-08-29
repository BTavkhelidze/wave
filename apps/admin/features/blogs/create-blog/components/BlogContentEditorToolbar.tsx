import type { Editor } from "@tiptap/react";

type BlogContentEditorToolbarProps = {
  editor: Editor;
  onAddImage: () => void;
  hasImageError: boolean;
  isUploadingImage: boolean;
};

type ToolbarButton = {
  label: string;
  title: string;
  isActive?: () => boolean;
  canRun: () => boolean;
  run: () => void;
};

const toolbarButtonBaseClassName =
  "rounded-md border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50";

export function BlogContentEditorToolbar({
  editor,
  onAddImage,
  hasImageError,
  isUploadingImage,
}: BlogContentEditorToolbarProps) {
  const canAddImage = editor
    .can()
    .chain()
    .focus()
    .setImage({ src: "blob:temporary-preview", alt: "" })
    .run();
  const toolbarButtons: ToolbarButton[] = [
    {
      label: "Undo",
      title: "Undo",
      canRun: () => editor.can().chain().focus().undo().run(),
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      title: "Redo",
      canRun: () => editor.can().chain().focus().redo().run(),
      run: () => editor.chain().focus().redo().run(),
    },
    {
      label: "P",
      title: "Paragraph",
      isActive: () => editor.isActive("paragraph"),
      canRun: () => editor.can().chain().focus().setParagraph().run(),
      run: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "H2",
      title: "Heading 2",
      isActive: () => editor.isActive("heading", { level: 2 }),
      canRun: () =>
        editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      title: "Heading 3",
      isActive: () => editor.isActive("heading", { level: 3 }),
      canRun: () =>
        editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "B",
      title: "Bold",
      isActive: () => editor.isActive("bold"),
      canRun: () => editor.can().chain().focus().toggleBold().run(),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      title: "Italic",
      isActive: () => editor.isActive("italic"),
      canRun: () => editor.can().chain().focus().toggleItalic().run(),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "S",
      title: "Strike",
      isActive: () => editor.isActive("strike"),
      canRun: () => editor.can().chain().focus().toggleStrike().run(),
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Bullets",
      title: "Bullet list",
      isActive: () => editor.isActive("bulletList"),
      canRun: () => editor.can().chain().focus().toggleBulletList().run(),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbers",
      title: "Ordered list",
      isActive: () => editor.isActive("orderedList"),
      canRun: () => editor.can().chain().focus().toggleOrderedList().run(),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      title: "Blockquote",
      isActive: () => editor.isActive("blockquote"),
      canRun: () => editor.can().chain().focus().toggleBlockquote().run(),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code",
      title: "Code block",
      isActive: () => editor.isActive("codeBlock"),
      canRun: () => editor.can().chain().focus().toggleCodeBlock().run(),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "Rule",
      title: "Horizontal rule",
      canRun: () => editor.can().chain().focus().setHorizontalRule().run(),
      run: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "Clear",
      title: "Clear formatting",
      canRun: () =>
        editor.can().chain().focus().unsetAllMarks().clearNodes().run(),
      run: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] bg-[#F8FAFC] p-3">
      {toolbarButtons.map((button) => {
        const isActive = button.isActive?.() ?? false;

        return (
          <button
            key={button.title}
            type="button"
            title={button.title}
            aria-label={button.title}
            aria-pressed={button.isActive ? isActive : undefined}
            disabled={!button.canRun()}
            onClick={button.run}
            className={`${toolbarButtonBaseClassName} ${
              isActive
                ? "border-[#7C3AED] bg-[#F5F3FF] text-[#6D28D9]"
                : "border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F8FAFC]"
            }`}
          >
            {button.label}
          </button>
        );
      })}

      <button
        type="button"
        title="Add image"
        aria-label={isUploadingImage ? "Uploading image" : "Add image"}
        aria-invalid={hasImageError}
        disabled={!canAddImage || isUploadingImage}
        onClick={onAddImage}
        className={`${toolbarButtonBaseClassName} border-[#C4B5FD] bg-white text-[#6D28D9] hover:bg-[#F5F3FF]`}
      >
        {isUploadingImage ? "Uploading" : "Image"}
      </button>
    </div>
  );
}
