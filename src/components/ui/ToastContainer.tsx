import { useToasts } from "../../data/ToastContext";

const ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const STYLES: Record<string, string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  error: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

const ICON_STYLES: Record<string, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  error: "bg-rose-500/20 text-rose-400",
  warning: "bg-amber-500/20 text-amber-400",
  info: "bg-sky-500/20 text-sky-400",
};

export default function ToastContainer() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[70] flex flex-col gap-2 pointer-events-none" dir="rtl">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md bg-card/90 shadow-lg text-sm font-medium pointer-events-auto
            ${STYLES[t.type]} animate-[slideInToast_0.25s_ease-out_both]`}
          role="alert"
          aria-live="polite"
        >
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ICON_STYLES[t.type]}`}>
            {ICONS[t.type]}
          </span>
          <span className="text-foreground">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
