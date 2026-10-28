import { useEffect, useState } from "react";
import { ArrowUpLeft, ShieldCheck } from "lucide-react";
import { API_ENABLED, gql } from "../data/api";
import { useAuth } from "../data/AuthContext";
import type { PageKey } from "../App";

type WorkspaceInfo = { name: string; isTrial: boolean; trialExpiresAt: string | null };
const steps: { title: string; detail: string; page: PageKey }[] = [
  { title: "استقبل العميل", detail: "اربط العميل بسيارته، ثم احجز موعد الصيانة.", page: "customers" },
  { title: "شخّص السيارة", detail: "سجّل الفحص والملاحظات قبل اقتراح الأعمال.", page: "inspections" },
  { title: "اعرض السعر", detail: "قدّم العرض، ثم سجّل القرار. لا تغيّر العرض المعتمد.", page: "quotations" },
  { title: "ابدأ التنفيذ", detail: "حوّل عرضاً معتمداً لأمر تشغيل؛ تُحجز القطع المتاحة له.", page: "work-orders" },
  { title: "استلم التوريد", detail: "استلام طلب الشراء يضيف الكمية للمخزون مرة واحدة.", page: "purchase-orders" },
  { title: "حصّل وسلّم", detail: "أكمل العمل، أصدر الفاتورة وسجّل السداد، ثم سلّم السيارة.", page: "invoices" },
];

export default function WorkspaceGuide({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [expanded, setExpanded] = useState(true);
  useEffect(() => {
    if (!API_ENABLED || !user) return;
    let active = true;
    gql<{ workspaceInfo: WorkspaceInfo | null }>("query { workspaceInfo { name isTrial trialExpiresAt } }").then(data => { if (active) setWorkspace(data.workspaceInfo); }).catch(() => {});
    return () => { active = false; };
  }, [user?.email, user?.accessToken]);
  if (!workspace) return null;
  return <section className="mx-6 mt-6 bg-card border border-border rounded-2xl p-5 space-y-4" dir="rtl" aria-label="دليل دورة التشغيل">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="flex items-center gap-2 text-xs text-primary"><ShieldCheck size={15} />{workspace.isTrial ? "مساحة تجربة مستقلة" : "دليل التشغيل"}</span><h2 className="text-lg font-bold text-foreground mt-2">{workspace.name} — جرّب رحلة صيانة كاملة</h2>{workspace.isTrial && workspace.trialExpiresAt && <p className="text-xs text-muted-foreground mt-2">تنتهي التجربة في {new Date(workspace.trialExpiresAt).toLocaleDateString("ar-SA")} · استخدم بيانات اختبار فقط · محاكاة Telegram تتطلب ربط بوت خاص بك من صفحة الصلاحيات</p>}</div><button type="button" className="text-sm text-muted-foreground border border-border rounded-lg px-3 py-2" aria-expanded={expanded} onClick={() => setExpanded(previous => !previous)}>{expanded ? "طيّ الدليل" : "عرض الدليل"}</button></div>
    {expanded && <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{steps.map((step, index) => <li key={step.page}><button type="button" onClick={() => onNavigate(step.page)} className="text-right w-full h-full rounded-xl border border-border p-4 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary transition-colors"><span className="flex items-center justify-between text-sm font-semibold text-foreground"><span><span className="text-primary ml-2">{String(index + 1).padStart(2, "0")}</span>{step.title}</span><ArrowUpLeft size={16} /></span><span className="block text-xs text-muted-foreground leading-6 mt-2">{step.detail}</span></button></li>)}</ol>}
  </section>;
}
