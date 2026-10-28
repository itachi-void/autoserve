import { createContext, useContext, useEffect, useId, useRef, useState, useCallback, type ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmCtx {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  pending: (ConfirmOptions & { resolve: (v: boolean) => void }) | null;
}

const Ctx = createContext<ConfirmCtx | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPending({ ...opts, resolve });
    });
  }, []);

  const answer = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setPending(null);
  }, []);

  return (
    <Ctx.Provider value={{ confirm, pending }}>
      {children}
      {pending && (
        <ConfirmDialogInternal opts={pending} onAnswer={answer} />
      )}
    </Ctx.Provider>
  );
}

function ConfirmDialogInternal({
  opts,
  onAnswer,
}: {
  opts: ConfirmOptions;
  onAnswer: (v: boolean) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const headingId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onAnswer(false); }
      if (event.key === "Tab") { const buttons = panel.current?.querySelectorAll<HTMLButtonElement>("button"); if (!buttons?.length) return; const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); if (previous?.isConnected) previous.focus(); };
  }, [onAnswer]);
  return (
    <div
      className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4"
      onClick={() => onAnswer(false)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div
        ref={panel}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId} className="text-base font-bold text-foreground mb-2">{opts.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{opts.message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => onAnswer(false)}
            className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:bg-secondary/60 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => onAnswer(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 ${
              opts.danger
                ? "bg-rose-500 text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {opts.confirmLabel ?? "تأكيد"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx.confirm;
}
