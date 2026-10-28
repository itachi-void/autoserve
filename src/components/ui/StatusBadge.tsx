type Tone = "success" | "info" | "warning" | "danger" | "neutral";

const STATUS_TONE: Record<string, Tone> = {
  // Green / success
  "نشط": "success",
  "متوفر": "success",
  "مكتمل": "success",
  "مدفوع": "success",
  "وصل": "success",
  "موافق": "success",
  "ممتاز": "success",
  "مؤكد": "success",
  "جيد": "success",
  // Blue / info
  "جاري": "info",
  "في الطريق": "info",
  // Amber / warning
  "انتظار قطع": "warning",
  "انتظار موافقة": "warning",
  "منخفض": "warning",
  "جزئي": "warning",
  "مشغول": "warning",
  "معلق": "warning",
  "يحتاج صيانة": "warning",
  "VIP": "warning",
  // Rose / danger
  "دين": "danger",
  "متأخر": "danger",
  "نفاد": "danger",
  "مرفوض": "danger",
  "موقوف": "danger",
  "خطر": "danger",
  "موقوف مؤقتاً": "danger",
  // Slate / neutral
  "مجدول": "neutral",
  "قادم": "neutral",
  "منتهي الصلاحية": "neutral",
  "ملغي": "neutral",
  "إجازة": "neutral",
  "—": "neutral",
};

const TONE_CLASS: Record<Tone, string> = {
  success: "badge-success",
  info: "badge-info",
  warning: "badge-warning",
  danger: "badge-danger",
  neutral: "badge-neutral",
};

const PING_DOT: Partial<Record<Tone, string>> = {
  info: "bg-sky-400",
  warning: "bg-amber-400",
};

/** Back-compat map so callers passing `overrideColors` keyed by status keep working. */
export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TONE).map(([k, tone]) => [k, TONE_CLASS[tone]]),
);

interface Props {
  status: string;
  className?: string;
  overrideColors?: Record<string, string>;
}

export default function StatusBadge({ status, className = "", overrideColors }: Props) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const color = overrideColors?.[status] ?? TONE_CLASS[tone];
  const pingColor = PING_DOT[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border font-medium ${color} ${className}`}>
      {pingColor && (
        <span className="relative flex-shrink-0 w-1.5 h-1.5">
          <span className={`absolute inset-0 rounded-full ${pingColor} opacity-60 animate-ping`} />
          <span className={`relative block w-1.5 h-1.5 rounded-full ${pingColor}`} />
        </span>
      )}
      {status}
    </span>
  );
}
