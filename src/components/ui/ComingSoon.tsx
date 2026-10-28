interface Props {
  /** Optional short label; defaults to "قريبًا". */
  label?: string;
  /** "dot" = tiny inline pill, "tag" = labelled pill (default). */
  variant?: "tag" | "dot";
  className?: string;
  /** Optional tooltip explaining the feature has no backend yet. */
  title?: string;
}

/**
 * Marks a UI element whose data has no counterpart in the GraphQL API yet —
 * i.e. a design-only ("coming feature") field, section, or module. Amber, with
 * a subtle animated pulse so it reads as intentionally pending, not broken.
 */
export default function ComingSoon({
  label = "قريبًا",
  variant = "tag",
  className = "",
  title = "تفاصيل إضافية ستتوفر لاحقاً",
}: Props) {
  const description = /API|تصميم/.test(title) ? "تفاصيل إضافية غير متاحة حالياً" : title;
  if (variant === "dot") {
    return (
      <span
        title={description}
        className={`relative inline-flex flex-shrink-0 w-2 h-2 align-middle ${className}`}
      >
        <span className="absolute inset-0 rounded-full bg-amber-400/60 animate-ping" />
        <span className="relative block w-2 h-2 rounded-full bg-amber-400" />
      </span>
    );
  }
  return (
    <span
      title={description}
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-500 dark:text-amber-300 leading-none ${className}`}
    >
      <span className="relative flex-shrink-0 w-1.5 h-1.5">
        <span className="absolute inset-0 rounded-full bg-amber-400/60 animate-ping" />
        <span className="relative block w-1.5 h-1.5 rounded-full bg-amber-400" />
      </span>
      {label}
    </span>
  );
}
