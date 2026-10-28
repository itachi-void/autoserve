import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import PageHeader from "./ui/PageHeader";
import type { PageKey } from "../App";

interface Props { onNavigate: (page: PageKey) => void; }

export default function Quotations({ onNavigate }: Props) {
  const { quotations, updateQuotation, customers, vehicles, services, workOrders, addQuotation, addWorkOrder } = useAppData();
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customer: "", car: "", service: "", discount: "0", validUntil: "" });

  const selectedQt = quotations.find((q) => q.id === selected);

  async function handleApprove(id: string) {
    if ((await updateQuotation(id, { status: "موافق", approvedAt: new Date().toLocaleDateString("ar-SA") })) === false) return;
  }

  async function handleReject(id: string) {
    if ((await updateQuotation(id, { status: "مرفوض", approvedAt: "" })) === false) return;
  }
  async function createWorkOrder() {
    if (!selectedQt || selectedQt.status !== "موافق") return;
    const exists = workOrders.some(order => order.estimateId === selectedQt.apiId && Boolean(selectedQt.apiId));
    if (exists) return;
    if ((await addWorkOrder({ id: `WO-${String(Date.now()).slice(-5)}`, estimateId: selectedQt.apiId, customer: selectedQt.customer, car: selectedQt.car, services: selectedQt.services.map((item) => item.name), parts: selectedQt.parts.map((item) => item.name), tech: "غير مسند", status: "مجدول", priority: "عادي", total: selectedQt.subtotal - selectedQt.discount, date: new Date().toLocaleDateString("ar-SA"), progress: 0 })) === false) return;
    onNavigate("work-orders");
  }
  async function saveQuotation() {
    const service = services.find((item) => item.name === form.service);
    if (!form.customer || !form.car || !service) return;
    const discount = Math.min(service.basePrice, Math.max(0, Number(form.discount) || 0));
    const rawSubtotal = service.basePrice;
    const subtotal = rawSubtotal;
    const vat = Math.round((subtotal - discount) * 0.15 * 100) / 100;
    if ((await addQuotation({ id: `QT-${String(quotations.length + 1).padStart(3, "0")}`, customer: form.customer, car: form.car, date: new Date().toLocaleDateString("ar-SA"), validUntil: form.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), services: [{ name: service.name, price: service.basePrice, qty: 1 }], parts: [], discount, subtotal, vat, total: subtotal - discount + vat, status: "انتظار موافقة", approvedAt: "" })) === false) return;
    setShowCreate(false);
  }

  const pendingCount = quotations.filter((q) => q.status === "انتظار موافقة").length;
  const approvedCount = quotations.filter((q) => q.status === "موافق").length;
  const rejectedCount = quotations.filter((q) => q.status === "مرفوض").length;
  const rateBase = approvedCount + rejectedCount;
  const approvalRate = rateBase > 0 ? Math.round((approvedCount / rateBase) * 100) : 0;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="عروض الأسعار"
        subtitle={`${toArabicNum(quotations.length)} عروض · ${toArabicNum(pendingCount)} بانتظار الموافقة`}
        actions={
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
            + عرض سعر جديد
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "انتظار موافقة", value: toArabicNum(pendingCount), color: "text-primary", bg: "bg-primary/5" },
          { label: "تمت الموافقة", value: toArabicNum(approvedCount), color: "text-emerald-400", bg: "bg-emerald-500/5" },
          { label: "مرفوضة", value: toArabicNum(rejectedCount), color: "text-rose-400", bg: "bg-rose-500/5" },
          { label: "معدل الموافقة", value: `${toArabicNum(approvalRate)}٪`, color: "text-sky-400", bg: "bg-sky-500/5" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-border rounded-xl p-4`}>
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-3">
          {quotations.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelected(selected === q.id ? null : q.id)}
              className={`w-full text-right bg-card border rounded-xl p-4 hover:border-primary/40 transition-all ${
                selected === q.id ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-primary text-xs">{q.id}</span>
                <StatusBadge status={q.status} />
              </div>
              <div className="text-foreground font-medium text-sm">{q.customer}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{q.car}</div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-muted-foreground">{q.date} · صالح حتى {q.validUntil}</div>
                <div className="font-mono text-foreground font-semibold text-sm">{toArabicNum(q.total)} ر.س</div>
              </div>
              {q.discount > 0 && (
                <div className="mt-1.5 text-xs text-emerald-400 font-mono">✓ خصم {toArabicNum(q.discount)} ر.س مطبّق</div>
              )}
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {!selectedQt ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm flex-col gap-2">
              <span className="text-3xl">📄</span>
              <span>اختر عرض سعر لعرض التفاصيل</span>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-mono text-primary text-xs mb-1">{selectedQt.id}</div>
                  <div className="font-bold text-foreground text-lg">{selectedQt.customer}</div>
                  <div className="text-sm text-muted-foreground">{selectedQt.car}</div>
                  {selectedQt.presentedAt && (
                    <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono">عُرض في: {selectedQt.presentedAt}</div>
                  )}
                  {selectedQt.linkedInspection && (
                    <div className="text-[10px] mt-1">
                      <span className="text-sky-400/80 font-mono">↗ فحص: {selectedQt.linkedInspection}</span>
                    </div>
                  )}
                </div>
                <StatusBadge status={selectedQt.status} />
              </div>

              {selectedQt.services.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground font-mono mb-2">الخدمات:</div>
                  {selectedQt.services.map((s) => (
                    <div key={s.name} className="flex justify-between items-center text-sm py-1.5 border-b border-border/50 gap-2">
                      <span className="text-secondary-foreground flex-1">{s.name}</span>
                      {s.decision && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${s.decision === "مقبول" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : s.decision === "مرفوض" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                          {s.decision}
                        </span>
                      )}
                      <span className="font-mono text-foreground">{toArabicNum(s.price * s.qty)} ر.س</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedQt.parts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground font-mono mb-2">قطع الغيار:</div>
                  {selectedQt.parts.map((p) => (
                    <div key={p.name} className="flex justify-between items-center text-sm py-1.5 border-b border-border/50 gap-2">
                      <span className="text-secondary-foreground flex-1">{p.name} × {toArabicNum(p.qty)}</span>
                      {p.decision && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${p.decision === "مقبول" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : p.decision === "مرفوض" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                          {p.decision}
                        </span>
                      )}
                      <span className="font-mono text-foreground">{toArabicNum(p.price * p.qty)} ر.س</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع قبل الضريبة</span>
                  <span className="font-mono">{toArabicNum(selectedQt.subtotal)} ر.س</span>
                </div>
                {selectedQt.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>خصم {toArabicNum(selectedQt.discount)} ر.س</span>
                    <span className="font-mono">— مطبّق</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>ضريبة القيمة المضافة ١٥٪</span>
                  <span className="font-mono">{toArabicNum(selectedQt.vat)} ر.س</span>
                </div>
                <div className="flex justify-between text-foreground font-bold pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="font-mono text-primary">{toArabicNum(selectedQt.total)} ر.س</span>
                </div>
              </div>

              {selectedQt.status === "انتظار موافقة" && (
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleReject(selectedQt.id)} className="flex-1 py-2 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-sm hover:bg-rose-500/25 transition-colors">تسجيل رفض</button>
                  <button onClick={() => handleApprove(selectedQt.id)} className="flex-1 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm hover:bg-emerald-500/25 transition-colors">تأكيد الموافقة</button>
                </div>
              )}
              {selectedQt.status === "موافق" && (
                <button onClick={createWorkOrder} className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">تحويل لأمر تشغيل ←</button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="إنشاء عرض سعر جديد"
        maxWidth="max-w-lg"
        actions={
          <>
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveQuotation} disabled={!form.customer || !form.car || !form.service} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إنشاء وإرسال</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="العميل" htmlFor="qt-customer">
            <select id="qt-customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value, car: "" })} className={inputClass}>
              <option value="">اختر العميل</option>
              {customers.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="السيارة" htmlFor="qt-car">
            <select id="qt-car" value={form.car} onChange={(e) => setForm({ ...form, car: e.target.value })} className={inputClass}>
              <option value="">اختر السيارة</option>
              {vehicles.filter((vehicle) => vehicle.owner === form.customer).map((vehicle) => <option key={vehicle.vin}>{vehicle.make} {vehicle.model} — {vehicle.plate}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="الخدمة" htmlFor="qt-service"><select id="qt-service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputClass}><option value="">اختر الخدمة</option>{services.map((service) => <option key={service.id}>{service.name}</option>)}</select></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="قيمة الخصم (ر.س)" htmlFor="qt-discount">
            <input id="qt-discount" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="٠" type="number" min="0" step="0.01" className={`${inputClass} font-mono`} />
          </FormField>
          <FormField label="صالح حتى" htmlFor="qt-valid">
            <input id="qt-valid" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} type="date" className={inputClass} />
          </FormField>
        </div>
        <FormField label="ملاحظات للعميل" htmlFor="qt-notes">
          <textarea id="qt-notes" rows={3} placeholder="شروط أو ملاحظات إضافية..." className={`${inputClass} resize-none`} />
        </FormField>
      </Modal>
    </div>
  );
}
