import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import FilterPills from "./ui/FilterPills";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import PageHeader from "./ui/PageHeader";

export default function PurchaseOrders() {
  const { purchaseOrders, setPurchaseOrders, suppliers, parts, addPurchaseOrder, receivePurchaseOrder } = useAppData();
  const [filter, setFilter] = useState("الكل");
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ supplier: "", part: "", date: "", expectedDate: "", qty: "", unit: "قطعة", notes: "" });

  const filters = ["الكل", "معلق", "في الطريق", "وصل", "متأخر"];
  const filtered = filter === "الكل" ? purchaseOrders : purchaseOrders.filter((o) => o.status === filter);
  const selectedOrder = purchaseOrders.find((o) => o.id === selected);

  const pendingCount = purchaseOrders.filter((o) => o.status === "معلق").length;
  const transitCount = purchaseOrders.filter((o) => o.status === "في الطريق").length;
  const arrivedCount = purchaseOrders.filter((o) => o.status === "وصل").length;
  const lateCount = purchaseOrders.filter((o) => o.status === "متأخر").length;
  const totalValue = purchaseOrders.reduce((s, o) => s + o.total, 0);

  async function approveOrder(id: string) {
    if ((await setPurchaseOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "في الطريق" } : o))) === false) return;
  }

  async function markReceived(id: string) {
    if ((await receivePurchaseOrder(id)) === false) return;
  }
  async function cancelOrder(id: string) {
    if ((await setPurchaseOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "ملغى" } : o))) === false) return;
  }
  async function saveOrder() {
    const supplier = suppliers.find((item) => item.name === form.supplier);
    const part = parts.find((item) => item.name === form.part);
    if (!supplier || !part || !form.date || !form.expectedDate || !form.qty || Number(form.qty) <= 0) return;
    const qty = Number(form.qty);
    if ((await addPurchaseOrder({ id: `PO-${String(purchaseOrders.length + 1).padStart(3, "0")}`, supplier: supplier.name, supplierCode: supplier.code, date: form.date, expectedDate: form.expectedDate, items: [{ name: part.name, qty, unit: form.unit, unitPrice: part.price, total: qty * part.price }], total: qty * part.price, status: "معلق", notes: form.notes })) === false) return;
    setForm({ supplier: "", part: "", date: "", expectedDate: "", qty: "", unit: "قطعة", notes: "" }); setShowCreate(false);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageHeader
        title="أوامر الشراء"
        subtitle={`${toArabicNum(purchaseOrders.length)} أمر · قيمة إجمالية ${toArabicNum(totalValue)} ر.س`}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            + أمر شراء جديد
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "معلقة", value: pendingCount, color: "text-primary", bg: "bg-primary/8", border: "border-primary/20" },
          { label: "في الطريق", value: transitCount, color: "text-sky-400", bg: "bg-sky-500/8", border: "border-sky-500/20" },
          { label: "وصلت", value: arrivedCount, color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20" },
          { label: "متأخرة", value: lateCount, color: "text-rose-400", bg: "bg-rose-500/8", border: "border-rose-500/20" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <div className={`text-3xl font-bold font-mono ${s.color}`}>{toArabicNum(s.value)}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {lateCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-rose-400 text-xl" aria-hidden="true">⚠️</span>
          <div>
            <div className="text-rose-400 font-semibold text-sm">أوامر شراء متأخرة</div>
            <div className="text-rose-400/70 text-xs">{toArabicNum(lateCount)} أمر تجاوز تاريخ التسليم المتوقع — يُنصح بالتواصل مع الموردين</div>
          </div>
        </div>
      )}

      <FilterPills options={filters} selected={filter} onChange={setFilter} />

      <div className="grid grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-3">
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(selected === o.id ? null : o.id)}
              className={`w-full text-right bg-card border rounded-xl p-4 hover:border-primary/40 transition-all ${
                selected === o.id ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-primary text-xs">{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-foreground font-semibold text-sm">{o.supplier}</div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">{o.supplierCode}</div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-muted-foreground/60">{o.date} · تسليم {o.expectedDate}</div>
                <div className="font-mono text-foreground font-semibold text-sm">{toArabicNum(o.total)} ر.س</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">{toArabicNum(o.items.length)} صنف</div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {!selectedOrder ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm flex-col gap-2 p-10">
              <span className="text-3xl">📦</span>
              <span>اختر أمر شراء لعرض التفاصيل</span>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-mono text-primary text-xs mb-1">{selectedOrder.id}</div>
                  <div className="font-bold text-foreground text-lg">{selectedOrder.supplier}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.supplierCode}</div>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div>
                  <div className="text-muted-foreground/60 text-xs mb-0.5">تاريخ الأمر</div>
                  <div className="text-secondary-foreground">{selectedOrder.date}</div>
                </div>
                <div>
                  <div className="text-muted-foreground/60 text-xs mb-0.5">تاريخ التسليم المتوقع</div>
                  <div className="text-secondary-foreground">{selectedOrder.expectedDate}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-muted-foreground font-mono mb-2">الأصناف المطلوبة:</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="bg-secondary rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-foreground font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{toArabicNum(item.qty)} {item.unit} × {toArabicNum(item.unitPrice)} ر.س</div>
                        </div>
                        <div className="font-mono text-primary text-sm font-semibold">{toArabicNum(item.total)} ر.س</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 mb-4">
                <div className="flex justify-between text-foreground font-bold">
                  <span>الإجمالي</span>
                  <span className="font-mono text-primary">{toArabicNum(selectedOrder.total)} ر.س</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-secondary/50 border border-border rounded-xl p-3 mb-4">
                  <div className="text-xs text-muted-foreground mb-1 font-mono">ملاحظات:</div>
                  <div className="text-sm text-secondary-foreground">{selectedOrder.notes}</div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedOrder.status === "معلق" && (
                  <>
                    <button onClick={() => approveOrder(selectedOrder.id)} className="flex-1 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm hover:bg-emerald-500/25 transition-colors">✓ اعتماد الأمر</button>
                    <button onClick={() => cancelOrder(selectedOrder.id)} className="flex-1 py-2 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-sm hover:bg-rose-500/25 transition-colors">إلغاء الأمر</button>
                  </>
                )}
                {(selectedOrder.status === "في الطريق" || selectedOrder.status === "متأخر") && (
                  <button onClick={() => markReceived(selectedOrder.id)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">✓ تأكيد الاستلام</button>
                )}
                {selectedOrder.status === "وصل" && (
                  <div className="flex-1 py-2 text-center text-sm text-emerald-400 font-semibold">✓ تم الاستلام والإضافة للمخزن</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="إنشاء أمر شراء جديد"
        maxWidth="max-w-lg"
        actions={
          <>
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm hover:border-primary/40 transition-colors">إلغاء</button>
            <button onClick={saveOrder} disabled={!form.supplier || !form.part || !form.date || !form.expectedDate || !form.qty} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">إنشاء الأمر</button>
          </>
        }
      >
        <FormField label="المورد" htmlFor="po-supplier">
          <select id="po-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={inputClass}>
            <option value="">اختر المورد</option>
            {suppliers.map((s) => <option key={s.code}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label="قطعة الغيار" htmlFor="po-part"><select id="po-part" value={form.part} onChange={(e) => setForm({ ...form, part: e.target.value })} className={inputClass}><option value="">اختر القطعة</option>{parts.map((part) => <option key={part.sku}>{part.name}</option>)}</select></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="تاريخ الأمر" htmlFor="po-date">
            <input id="po-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="تاريخ التسليم المتوقع" htmlFor="po-expected">
            <input id="po-expected" type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} className={inputClass} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="الكمية" htmlFor="po-qty">
            <input id="po-qty" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="١" className={`${inputClass} font-mono`} />
          </FormField>
          <FormField label="الوحدة" htmlFor="po-unit">
            <select id="po-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
              <option>قطعة</option><option>طقم</option><option>لتر</option><option>علبة</option>
            </select>
          </FormField>
        </div>
        <FormField label="ملاحظات" htmlFor="po-notes">
          <textarea id="po-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="تعليمات خاصة للمورد..." className={`${inputClass} resize-none`} />
        </FormField>
      </Modal>
    </div>
  );
}
