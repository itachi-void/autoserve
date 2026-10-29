import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import { useEffect, useState } from "react";
import type { RecordFocus } from "../App";
import StatusBadge from "./ui/StatusBadge";
import FilterPills from "./ui/FilterPills";
import PageHeader from "./ui/PageHeader";
import ProgressBar from "./ui/ProgressBar";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import EmptyState from "./ui/EmptyState";
import { useToast } from "../data/ToastContext";

const priorityColors: Record<string, string> = {
  "عادي": "text-muted-foreground",
  "عاجل": "text-rose-400",
  "VIP": "text-primary",
};

export default function WorkOrders({ recordFocus }: { recordFocus?: RecordFocus }) {
  const { workOrders, customers, vehicles, services, invoices, addWorkOrder, updateWorkOrder } = useAppData();
  const toast = useToast();
  const [filter, setFilter] = useState("الكل");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  useEffect(() => { setFocusedId(recordFocus?.id ?? null); setFilter("الكل"); }, [recordFocus]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customer: "", car: "", service: "" });
  const saveOrder = async () => {
    const service = services.find((item) => item.name === form.service);
    if (!form.customer || !form.car || !service) return;
    if ((await addWorkOrder({ id: `WO-${Date.now().toString().slice(-5)}`, customer: form.customer, car: form.car, services: [service.name], parts: [], tech: "غير مسند", status: "مجدول", priority: "عادي", total: service.basePrice, date: new Date().toLocaleDateString("ar-SA"), progress: 0 })) === false) return;
    toast("تم إنشاء أمر التشغيل بنجاح");
    setShowAdd(false);
  };
  const filters = ["الكل", "جاري", "انتظار قطع", "مجدول", "مكتمل"];
  const filtered = workOrders.filter(order => (!focusedId || order.id === focusedId) && (filter === "الكل" || order.status === filter));

  const activeCount = workOrders.filter((o) => o.status === "جاري" || o.status === "انتظار قطع").length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6" dir="rtl">
      <PageHeader
        title="أوامر التشغيل"
        subtitle={`${toArabicNum(workOrders.length)} أمر · ${toArabicNum(activeCount)} نشط`}
        actions={
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
            + أمر جديد
          </button>
        }
      />
      {focusedId && <div className="record-search-context" role="status"><span>نتيجة البحث: {focusedId}</span><button onClick={() => setFocusedId(null)}>عرض كل الأوامر</button></div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "جاري التنفيذ", status: "جاري", color: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "انتظار قطع غيار", status: "انتظار قطع", color: "text-primary", bg: "bg-primary/10" },
          { label: "مكتملة", status: "مكتمل", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "مجدولة", status: "مجدول", color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-border rounded-xl p-3 sm:p-4`}>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${s.color}`}>
              {toArabicNum(workOrders.filter((o) => o.status === s.status).length)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <FilterPills options={filters} selected={filter} onChange={setFilter} />

      {/* Orders */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <EmptyState
            icon="🔧"
            title={filter === "الكل" ? "لا توجد أوامر تشغيل" : `لا توجد أوامر بحالة "${filter}"`}
            subtitle={filter === "الكل" ? "أنشئ أول أمر تشغيل للبدء" : "جرّب فلتراً مختلفاً"}
            action={filter === "الكل" ? { label: "+ أمر جديد", onClick: () => setShowAdd(true) } : undefined}
          />
        )}
        {filtered.map((o) => (
          <div key={o.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/40 transition-all cursor-pointer">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-primary text-sm font-semibold">{o.id}</span>
                {o.estimateId && <span className="font-mono text-[10px] text-muted-foreground">← {o.estimateId}</span>}
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${priorityColors[o.priority]}`}>
                  {o.priority === "عاجل" ? (
                    <span className="relative flex-shrink-0 w-1.5 h-1.5">
                      <span className="absolute inset-0 rounded-full bg-rose-400/60 animate-ping" />
                      <span className="relative block w-1.5 h-1.5 rounded-full bg-rose-400" />
                    </span>
                  ) : "●"}{" "}
                  {o.priority}
                </span>
                <StatusBadge status={o.status} />
                <select aria-label={`حالة أمر ${o.id}`} value={o.status} disabled={o.status === "تم التسليم" || o.status === "ملغي" || (o.status === "مكتمل" && !invoices.some(invoice => invoice.workOrder === o.id && invoice.status === "مدفوع"))} onChange={event => void updateWorkOrder(o.id, { status: event.target.value })} className="bg-secondary text-foreground border border-border rounded-lg px-2 py-1 text-xs">{(o.status === "مجدول" ? ["مجدول", "جاري", "انتظار قطع", "ملغي"] : o.status === "جاري" ? ["جاري", "انتظار قطع", "مكتمل", "ملغي"] : o.status === "انتظار قطع" ? ["انتظار قطع", "جاري", "ملغي"] : o.status === "مكتمل" ? ["مكتمل", "تم التسليم"] : [o.status]).map(status => <option key={status}>{status}</option>)}</select>
                {o.supplements && o.supplements.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                    +{toArabicNum(o.supplements.length)} ملحق
                  </span>
                )}
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                <div className="font-mono text-foreground font-semibold">{toArabicNum(o.total)} ر.س</div>
                <div className="text-xs text-muted-foreground">{o.date}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-3 bg-secondary/30 sm:bg-transparent rounded-xl p-3 sm:p-0">
              <div>
                <div className="text-xs text-muted-foreground/60 mb-0.5">العميل</div>
                <div className="text-sm font-medium text-foreground">{o.customer}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground/60 mb-0.5">السيارة</div>
                <div className="text-sm text-secondary-foreground">{o.car}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground/60 mb-0.5">الفني المسؤول</div>
                <div className="text-sm text-secondary-foreground">{o.tech}</div>
              </div>
            </div>

            {(o.startedAt || o.completedAt) && (
              <div className="flex gap-4 mb-3 text-[11px] font-mono text-muted-foreground">
                {o.startedAt && <span>▶ بدأ: {o.startedAt}</span>}
                {o.completedAt && <span className="text-emerald-400">✓ اكتمل: {o.completedAt}</span>}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {o.services.map((s) => (
                <span key={s} className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {o.parts.map((p) => (
                <span key={p} className="text-[11px] bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>

            {o.progress > 0 && (
              <ProgressBar
                value={o.progress}
                colorClass={o.progress === 100 ? "bg-emerald-500" : "bg-sky-500"}
                showLabel
              />
            )}

            {o.supplements && o.supplements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">الملاحق:</div>
                {o.supplements.map((sup, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-foreground/80 flex-1 ml-2">{sup.reason}</span>
                    <StatusBadge status={sup.status} />
                    <span className="font-mono text-amber-400 mr-2">{toArabicNum(sup.amount)} ر.س</span>
                  </div>
                ))}
              </div>
            )}

            {o.notes && (
              <div className="mt-2 text-[11px] text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-1.5">
                📝 {o.notes}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="أمر تشغيل جديد" actions={<><button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button><button onClick={saveOrder} disabled={!form.customer || !form.car || !form.service} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">إنشاء الأمر</button></>}>
        <FormField label="العميل" htmlFor="order-customer"><select id="order-customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value, car: "" })} className={inputClass}><option value="">اختر العميل</option>{customers.map((customer) => <option key={customer.id}>{customer.name}</option>)}</select></FormField><FormField label="السيارة" htmlFor="order-car"><select id="order-car" value={form.car} onChange={(e) => setForm({ ...form, car: e.target.value })} className={inputClass}><option value="">اختر السيارة</option>{vehicles.filter((vehicle) => vehicle.owner === form.customer).map((vehicle) => <option key={vehicle.vin}>{vehicle.make} {vehicle.model} — {vehicle.plate}</option>)}</select></FormField><FormField label="الخدمة" htmlFor="order-service"><select id="order-service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputClass}><option value="">اختر الخدمة</option>{services.map((service) => <option key={service.id}>{service.name}</option>)}</select></FormField>
      </Modal>
    </div>
  );
}
