import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useAppData } from "../../data/AppDataContext";

interface Props {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
  actions?: ReactNode; maxWidth?: string; onEnterSubmit?: () => void;
}

export default function Modal({ open, onClose, title, children, actions, maxWidth = "max-w-md", onEnterSubmit }: Props) {
  const { pending } = useAppData();
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const close = () => { if (pending) return; if (dirty) setDiscard(true); else onClose(); };
  const latest = useRef({ close, onEnterSubmit, pending });
  latest.current = { close, onEnterSubmit, pending };
  const hasDisabledAction = (content: ReactNode): boolean => Children.toArray(content).some(child => { if (!isValidElement<{ disabled?: boolean; children?: ReactNode }>(child)) return false; return (child.type === "button" && Boolean(child.props.disabled)) || hasDisabledAction(child.props.children); });

  useEffect(() => {
    if (!open) return;
    setDirty(false); setDiscard(false);
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => { const firstField = panel.current?.querySelector<HTMLElement>("input, select, textarea"); (firstField ?? panel.current)?.focus(); });
    const handler = (event: KeyboardEvent) => {
      const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'));
      if (dialogs.at(-1) !== panel.current?.parentElement) return;
      if (event.key === "Escape") { event.preventDefault(); latest.current.close(); }
      if (event.key === "Tab") {
        const elements = focusable(); const first = elements[0]; const last = elements.at(-1);
        if (!first) { event.preventDefault(); panel.current?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
      if (event.key === "Enter" && latest.current.onEnterSubmit && !latest.current.pending) {
        const tag = (event.target as HTMLElement).tagName;
        if (!["TEXTAREA", "SELECT", "BUTTON"].includes(tag)) { event.preventDefault(); latest.current.onEnterSubmit(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", handler); if (previous?.isConnected) previous.focus(); };
  }, [open]);

  useEffect(() => { if (discard) panel.current?.querySelector<HTMLButtonElement>("[data-continue-edit]")?.focus(); }, [discard]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={close} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div ref={panel} tabIndex={-1} className={`workspace-dialog bg-card border border-border rounded-2xl p-6 w-full ${maxWidth} max-h-[90dvh] overflow-y-auto`} onClick={event => event.stopPropagation()} onChangeCapture={() => setDirty(true)} onClickCapture={event => { const button = (event.target as HTMLElement).closest("button"); if (button?.textContent?.trim() === "إلغاء") { event.preventDefault(); event.stopPropagation(); close(); } }}>
        <div className="flex items-center justify-between gap-4 mb-5"><h2 id={titleId} className="text-lg font-bold text-foreground">{title}</h2><button type="button" aria-label="إغلاق النافذة" disabled={pending} onClick={close} className="dialog-close"><X size={20} /></button></div>
        {discard && <section className="dialog-discard" aria-label="تعديلات غير محفوظة"><p>عندك تعديلات غير محفوظة. هل تريد تجاهلها؟</p><div><button type="button" data-continue-edit onClick={() => setDiscard(false)}>متابعة التعديل</button><button type="button" onClick={onClose}>تجاهل التعديلات</button></div></section>}
        <div className="space-y-4">{children}</div>
        {!pending && actions && hasDisabledAction(actions) && <p className="text-xs text-muted-foreground mt-5" role="status">أكمل الحقول المطلوبة لتفعيل زر التأكيد.</p>}
        {actions && <div className="flex gap-3 mt-6">{actions}</div>}
      </div>
    </div>
  );
}
