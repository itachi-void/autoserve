import { useState, useEffect, useId, useRef } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum, toArabicCurrency } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import SearchBox from "./ui/SearchBox";
import PageHeader from "./ui/PageHeader";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import EmptyState from "./ui/EmptyState";
import type { RecordFocus } from "../App";
import { useToast } from "../data/ToastContext";
import type { Customer } from "../data/types";

function CustomerDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const drawer = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const latestClose = useRef(onClose);
  latestClose.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    drawer.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") latestClose.current();
      if (e.key === "Tab") { const buttons = drawer.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"); if (!buttons?.length) return; const first = buttons[0]; const last = buttons[buttons.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); if (previous?.isConnected) previous.focus(); };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={drawer} role="dialog" aria-modal="true" aria-labelledby={headingId} className="fixed top-0 right-0 h-full z-50 w-80 max-w-full bg-card border-r border-border shadow-2xl flex flex-col" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 id={headingId} className="font-semibold text-foreground text-sm">بيانات العميل</h2>
          <button aria-label="إغلاق بيانات العميل" onClick={onClose} className="dialog-close">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 border-b border-border/60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/60 to-primary/30 flex items-center justify-center text-primary text-xl font-bold mb-3">
              {customer.name[0]}
            </div>
            <div className="text-base font-semibold text-foreground">{customer.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={customer.status} />
              {customer.type && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20 font-medium">{customer.type}</span>
              )}
            </div>
          </div>
          <div className="px-5 py-4 border-b border-border/60">
            <div className="text-xs font-medium text-muted-foreground mb-2">بيانات التواصل والحساب</div>
            {[
              { label: "الرقم", value: customer.id, mono: true },
              { label: "الهاتف", value: customer.phone, mono: true },
              { label: "البريد الإلكتروني", value: customer.email, mono: true },
              { label: "العنوان", value: customer.address },
              { label: "النوع", value: customer.type },
              { label: "الدين", value: customer.debt > 0 ? toArabicCurrency(customer.debt) : "لا يوجد", mono: true },
              { label: "عدد السيارات", value: toArabicNum(customer.cars), mono: true },
              { label: "تاريخ التسجيل", value: customer.createdAt },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex justify-between items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground shrink-0">{f.label}</span>
                <span className={`text-xs text-foreground font-medium text-left ${f.mono ? "font-mono" : ""}`}>{f.value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              ملخص التعاملات
            </div>
            {[
              { label: "إجمالي المصروف", value: toArabicCurrency(customer.totalSpent) },
              { label: "آخر زيارة", value: customer.lastVisit },
            ].map(f => (
              <div key={f.label} className="flex justify-between items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground shrink-0">{f.label}</span>
                <span className="text-xs text-foreground font-medium font-mono">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Customers({ recordFocus }: { recordFocus?: RecordFocus }) {
  const { customers, addCustomer, pending } = useAppData();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: "فرد" });
  const [selected, setSelected] = useState<Customer | null>(null);
  const [formError, setFormError] = useState("");
  useEffect(() => { if (recordFocus) { const customer = customers.find(item => item.id === recordFocus.id); if (customer) { setSearch(""); setSelected(customer); } } }, [recordFocus]);

  const saveCustomer = async () => {
    if (pending) return;
    if (!form.name.trim() || !form.phone.trim()) { setFormError("أدخل اسم العميل ورقم هاتفه لإكمال التسجيل."); return; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setFormError("أدخل بريداً إلكترونياً صالحاً، أو اترك الحقل فارغاً."); return; }
    setFormError("");
    if ((await addCustomer({ id: `CUS-${String(customers.length + 1).padStart(3, "0")}`, name: form.name.trim(), phone: form.phone.trim(), cars: 0, totalSpent: 0, debt: 0, lastVisit: "لم يزر بعد", status: "نشط", email: form.email.trim() || undefined, type: form.type, createdAt: "أغسطس ٢٠٢٦" })) === false) return;
    toast(`تمت إضافة العميل ${form.name.trim()} بنجاح`);
    setForm({ name: "", phone: "", email: "", type: "فرد" }); setShowAdd(false);
  };

  const filtered = customers.filter(
    (c) => c.name.includes(search) || c.phone.includes(search) || c.id.includes(search)
  );

  const totalDebt = customers.reduce((s, c) => s + c.debt, 0);
  const debtors = customers.filter((c) => c.debt > 0);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="إدارة العملاء"
        subtitle={`${toArabicNum(customers.length)} عميل مسجل`}
        actions={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
            + إضافة عميل
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي العملاء", value: toArabicNum(customers.length), icon: "👥", color: "text-sky-400" },
          { label: "عملاء نشطون", value: toArabicNum(customers.filter((c) => c.status === "نشط" || c.status === "VIP").length), icon: "✅", color: "text-emerald-400" },
          { label: "لديهم ديون", value: toArabicNum(debtors.length), icon: "⚠️", color: "text-rose-400" },
          { label: "إجمالي الديون", value: toArabicCurrency(totalDebt), icon: "💳", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <SearchBox value={search} onChange={setSearch} placeholder="البحث بالاسم أو الهاتف أو الرقم..." id="customer-search" />

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? "لا توجد نتائج" : "لا يوجد عملاء بعد"}
            subtitle={search ? `لم يُعثر على عميل يطابق "${search}"` : "ابدأ بإضافة أول عميل للنظام"}
            action={search ? undefined : { label: "+ إضافة عميل", onClick: () => setShowAdd(true) }}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الرقم</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الاسم</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الهاتف</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">السيارات</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">
                  <span className="inline-flex items-center gap-1.5">إجمالي المصروف </span>
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الدين</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">
                  <span className="inline-flex items-center gap-1.5">آخر زيارة </span>
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium font-mono">الحالة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary text-xs">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{c.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.email && <span className="text-muted-foreground text-[10px] font-mono">{c.email}</span>}
                      {c.type && <span className="text-[9px] px-1 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">{c.type}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-sky-500/15 text-sky-400 text-xs px-2 py-0.5 rounded-full font-mono">{toArabicNum(c.cars)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-foreground text-xs">{toArabicCurrency(c.totalSpent)}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={c.debt === 0 ? "text-muted-foreground" : "text-rose-400 font-semibold"}>
                      {c.debt === 0 ? "—" : toArabicCurrency(c.debt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.lastVisit}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors" aria-label="خيارات" onClick={(e) => e.stopPropagation()}>⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}

      <Modal open={showAdd} onEnterSubmit={saveCustomer} onClose={() => setShowAdd(false)} title="إضافة عميل جديد" actions={
        <>
          <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button>
          <button onClick={saveCustomer} disabled={pending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">{pending ? "جاري الحفظ…" : "حفظ العميل"}</button>
        </>
      }>
        <p className="text-xs text-muted-foreground">اسم العميل ورقم الهاتف مطلوبان؛ باقي البيانات اختيارية.</p>
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <FormField label="اسم العميل *" htmlFor="customer-name"><input id="customer-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="رقم الهاتف" htmlFor="customer-phone"><input id="customer-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} dir="ltr" /></FormField>
          <FormField label="النوع" htmlFor="customer-type">
            <select id="customer-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
              <option>فرد</option>
              <option>شركة</option>
            </select>
          </FormField>
        </div>
        <FormField label="البريد الإلكتروني (اختياري)" htmlFor="customer-email"><input id="customer-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} dir="ltr" /></FormField>
      </Modal>
    </div>
  );
}
