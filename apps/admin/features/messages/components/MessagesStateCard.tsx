type MessagesStateCardProps = {
  title: string;
  message: string;
  tone: "error" | "neutral" | "success" | "warning";
  actionLabel?: string;
  onAction?: () => void;
};

export function MessagesStateCard({
  title,
  message,
  tone,
  actionLabel,
  onAction,
}: MessagesStateCardProps) {
  const classNameByTone: Record<MessagesStateCardProps["tone"], string> = {
    error: "border-[#FCA5A5]",
    neutral: "border-[#E5E7EB]",
    success: "border-[#A7F3D0]",
    warning: "border-[#FBBF24]",
  };
  const titleClassNameByTone: Record<MessagesStateCardProps["tone"], string> = {
    error: "text-[#B91C1C]",
    neutral: "text-[#111827]",
    success: "text-[#047857]",
    warning: "text-[#92400E]",
  };

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${classNameByTone[tone]}`}
    >
      <p className={`text-sm font-semibold ${titleClassNameByTone[tone]}`}>
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[#6B7280]">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
