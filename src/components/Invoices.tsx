import { useState } from "react";
import { useAppData } from "../data/AppDataContext";
import { toArabicNum } from "../utils/format";
import StatusBadge from "./ui/StatusBadge";
import FilterPills from "./ui/FilterPills";
import PageHeader from "./ui/PageHeader";
import Modal from "./ui/Modal";
import FormField, { inputClass } from "./ui/FormField";
import RecordFormModal from "./ui/RecordFormModal";

export default function Invoices() {
  const { invoices, workOrders, addInvoice, recordPayment } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("الكل");
  const [paymentInvoice, setPaymentInvoice] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const filters = ["الكل", "مدفوع", "معلق", "جزئي", "متأخر"];
  const filtered = filter === "الكل" ? invoices : invoices.filter((i) => i.status === filter);

  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalPending = invoices.reduce((s, i) => s + i.balance, 0);
  const totalLate = invoices.filter((i) => i.status === "متأخر").reduce((s, i) => s + i.balance, 0);
  const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
  const selectedInvoice = invoices.find((invoice) => invoice.id === paymentInvoice);
  const submitPayment = async () => {
    if (!selectedInvoice) return;
    const amount = Number(paymentAmount);
    if (!amount || amount < 0) return;
    if ((await recordPayment(selectedInvoice.id, amount)) === false) return; setPaymentInvoice(null); setPaymentAmount("");
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <RecordFormModal open={showCreate} onClose={() => setShowCreate(false)} title="إصدار فاتورة من أمر مكتمل" fields={[{ name: "order", label: "أمر التشغيل", options: workOrders.filter(order => order.status === "مكتمل" && !invoices.some(invoice => invoice.workOrder === order.id)).map(order => order.id) }, { name: "discount", label: "الخصم", type: "number", defaultValue: "0" }]} onSave={values => { const order = workOrders.find(item => item.id === values.order); if (!order) return Promise.resolve(false); const discount = Number(values.discount); const total = (order.total - discount) * 1.15; return addInvoice({ id: crypto.randomUUID(), customer: order.customer, workOrder: order.id, date: new Date().toLocaleDateString("ar-SA"), subtotal: order.total, discount, vat: (order.total - discount) * .15, total, paid: 0, balance: total, status: "معلق" }); }} />
      <PageHeader
        title="الفواتير والمدفوعات"
        subtitle="أغسطس ٢٠٢٦"
        actions={
          <>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:opacity-80 transition-colors border border-border">
              📥 تصدير
            </button>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
              + إصدار فاتورة
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي الإيرادات (ر.س)", value: toArabicNum(totalRevenue), color: "text-foreground", bg: "bg-card" },
          { label: "مدفوع (ر.س)", value: toArabicNum(totalPaid), color: "text-emerald-400", bg: "bg-emerald-500/5" },
          { label: "معلق (ر.س)", value: toArabicNum(totalPending), color: "text-primary", bg: "bg-primary/5" },
          { label: "متأخرة (ر.س)", value: toArabicNum(totalLate), color: "text-rose-400", bg: "bg-rose-500/5" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-border rounded-xl p-4`}>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Collection Rate */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono">
          <span>نسبة التحصيل</span>
          <span>{toArabicNum(collectionRate)}٪</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${collectionRate}%` }} />
        </div>
      </div>

      <FilterPills options={filters} selected={filter} onChange={setFilter} />

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["رقم الفاتورة", "العميل", "أمر التشغيل", "التاريخ", "المبلغ", "خصم", "الضريبة ١٥٪", "الإجمالي", "المدفوع", "تاريخ الدفع", "المتبقي", "الحالة", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-right text-xs text-muted-foreground font-medium font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer">
                <td className="px-3 py-3 font-mono text-primary text-xs">{inv.id}</td>
                <td className="px-3 py-3">
                  <div className="text-foreground">{inv.customer}</div>
                  {inv.car && <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{inv.car}</div>}
                </td>
                <td className="px-3 py-3 font-mono text-sky-400 text-xs">{inv.workOrder}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{inv.date}</td>
                <td className="px-3 py-3 font-mono text-secondary-foreground text-xs">{toArabicNum(inv.subtotal)}</td>
                <td className="px-3 py-3 font-mono text-xs">
                  {inv.discount && inv.discount > 0
                    ? <span className="text-emerald-400">-{toArabicNum(inv.discount)} ر.س</span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground text-xs">{toArabicNum(inv.vat)}</td>
                <td className="px-3 py-3 font-mono text-foreground text-xs font-semibold">{toArabicNum(inv.total)}</td>
                <td className="px-3 py-3 font-mono text-emerald-400 text-xs">{toArabicNum(inv.paid)}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{inv.paidAt ?? "—"}</td>
                <td className="px-3 py-3 font-mono text-xs">
                  <span className={inv.balance === 0 ? "text-muted-foreground" : "text-rose-400 font-semibold"}>
                    {inv.balance === 0 ? "—" : toArabicNum(inv.balance)}
                  </span>
                </td>
                <td className="px-3 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-3 py-3 flex gap-1">
                  <button className="text-[10px] px-2 py-1 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500/20 transition-colors border border-sky-500/20">طباعة</button>
                  {inv.balance > 0 && (
                    <button onClick={() => { setPaymentInvoice(inv.id); setPaymentAmount(String(inv.balance)); }} className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">دفع</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(selectedInvoice)} onClose={() => setPaymentInvoice(null)} title="تسجيل دفعة" actions={<><button onClick={() => setPaymentInvoice(null)} className="flex-1 py-2.5 border border-border text-muted-foreground rounded-xl text-sm">إلغاء</button><button onClick={submitPayment} disabled={!paymentAmount || Number(paymentAmount) <= 0} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50">تأكيد الدفع</button></>}>
        <p className="text-sm text-muted-foreground">فاتورة {selectedInvoice?.id} · المتبقي {toArabicNum(selectedInvoice?.balance ?? 0)} ر.س</p>
        {selectedInvoice?.payments && selectedInvoice.payments.length > 0 && (
          <div className="rounded-xl bg-secondary p-3 space-y-2 mb-1">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">سجل الدفعات:</div>
            {selectedInvoice.payments.map((pmt, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{pmt.date} · {pmt.method}</span>
                <span className="font-mono text-emerald-400">{toArabicNum(pmt.amount)} ر.س</span>
              </div>
            ))}
          </div>
        )}
        <FormField label="المبلغ المستلم (ر.س)" htmlFor="payment-amount"><input id="payment-amount" type="number" min="1" max={selectedInvoice?.balance} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className={`${inputClass} font-mono`} /></FormField>
      </Modal>
    </div>
  );
}
